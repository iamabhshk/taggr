import fs from 'fs-extra';
import path from 'path';
import crypto from 'crypto';
import type { Label, TaggrMetadata, LabelMetadata } from '../types.js';

const OUTPUT_DIR = './taggr';
const METADATA_FILE = path.join(OUTPUT_DIR, '.taggr.json');

/**
 * Calculate SHA256 checksum of a string
 */
function calculateChecksum(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculate checksum for a label value
 */
function calculateLabelChecksum(label: Label): string {
  // Ensure all required fields are present
  const name = label.name || '';
  const value = label.value !== undefined && label.value !== null ? String(label.value) : '';
  const version = label.version || '1.0.0';
  const data = `${name}:${value}:${version}`;
  return calculateChecksum(data);
}

/**
 * Calculate overall checksum for all labels
 */
function calculateOverallChecksum(labels: Label[]): string {
  const sortedLabels = [...labels]
    .filter(label => label && label.name) // Filter out invalid labels
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  const data = sortedLabels
    .map(label => {
      const name = label.name || '';
      const value = label.value !== undefined && label.value !== null ? String(label.value) : '';
      const version = label.version || '1.0.0';
      return `${name}:${value}:${version}`;
    })
    .join('|');
  return calculateChecksum(data);
}

/**
 * Get existing metadata or return null
 */
export async function getMetadata(): Promise<TaggrMetadata | null> {
  try {
    if (await fs.pathExists(METADATA_FILE)) {
      const content = await fs.readJson(METADATA_FILE);
      // Validate structure
      if (content && typeof content === 'object' && !Array.isArray(content)) {
        // Additional validation: ensure required fields exist
        if (typeof content.syncedAt === 'string' && 
            typeof content.apiUrl === 'string' && 
            content.labels && typeof content.labels === 'object') {
          return content as TaggrMetadata;
        } else {
          console.warn(`Warning: Metadata file at ${METADATA_FILE} has invalid structure.`);
          return null;
        }
      } else {
        console.warn(`Warning: Metadata file at ${METADATA_FILE} is corrupted.`);
        return null;
      }
    }
    return null;
  } catch (error: any) {
    // If file is corrupted, return null (will trigger re-sync)
    console.warn(`Warning: Could not read metadata file: ${error.message}`);
    return null;
  }
}

/**
 * Save metadata for synced labels
 */
export async function saveMetadata(
  labels: Label[],
  apiUrl: string
): Promise<void> {
  // Validate inputs
  if (!labels || !Array.isArray(labels)) {
    throw new Error('Labels must be a non-empty array');
  }
  if (!apiUrl || typeof apiUrl !== 'string') {
    throw new Error('API URL must be a non-empty string');
  }

  const now = new Date().toISOString();
  const labelMetadata: Record<string, LabelMetadata> = {};

  // Create metadata for each label
  for (const label of labels) {
    // Validate label has required properties
    if (!label || !label.name) {
      console.warn(`Warning: Skipping invalid label in metadata: ${JSON.stringify(label)}`);
      continue;
    }
    const key = label.name;
    labelMetadata[key] = {
      version: label.version || '1.0.0',
      syncedAt: now,
      checksum: calculateLabelChecksum(label),
    };
  }

  const metadata: TaggrMetadata = {
    syncedAt: now,
    apiUrl,
    labels: labelMetadata,
    overallChecksum: calculateOverallChecksum(labels),
  };

  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);
  
  // Write metadata file
  await fs.writeJson(METADATA_FILE, metadata, { spaces: 2 });
}

/**
 * Update metadata for a single label
 */
export async function updateLabelMetadata(
  label: Label,
  apiUrl: string
): Promise<void> {
  // Validate inputs
  if (!label || !label.name) {
    throw new Error('Label must have a name property');
  }
  if (!apiUrl || typeof apiUrl !== 'string') {
    throw new Error('API URL must be a non-empty string');
  }

  const existing = await getMetadata() || {
    syncedAt: new Date().toISOString(),
    apiUrl,
    labels: {},
    overallChecksum: '',
  };

  const now = new Date().toISOString();
  existing.labels[label.name] = {
    version: label.version || '1.0.0',
    syncedAt: now,
    checksum: calculateLabelChecksum(label),
  };
  existing.syncedAt = now;
  existing.apiUrl = apiUrl;

  // Recalculate overall checksum - we need all labels for this
  // For now, we'll update the single label's metadata
  // The overall checksum will be recalculated on next full sync
  await fs.ensureDir(OUTPUT_DIR);
  await fs.writeJson(METADATA_FILE, existing, { spaces: 2 });
}

/**
 * Get metadata file path
 */
export function getMetadataPath(): string {
  return path.resolve(METADATA_FILE);
}

/**
 * Check if labels.json has been manually edited
 * This compares the actual local file content with what should be there based on metadata
 */
export async function detectManualEdits(
  labels: Label[]
): Promise<{ isEdited: boolean; reason?: string }> {
  const metadata = await getMetadata();
  if (!metadata) {
    // No metadata means this might be a fresh install or manually created file
    // If labels.json exists without metadata, it was likely manually created
    const labelsJsonPath = path.join(OUTPUT_DIR, 'labels.json');
    if (await fs.pathExists(labelsJsonPath)) {
      return {
        isEdited: true,
        reason: 'Labels file exists but no sync metadata found. File may have been manually created.',
      };
    }
    return { isEdited: false };
  }

  const labelsJsonPath = path.join(OUTPUT_DIR, 'labels.json');
  if (!(await fs.pathExists(labelsJsonPath))) {
    return { isEdited: false };
  }

  try {
    // Read the actual local file
    const currentContent = await fs.readFile(labelsJsonPath, 'utf-8');
    const currentLabelsJson: Record<string, string> = JSON.parse(currentContent);
    
    // Build expected labels from metadata and API labels
    const expectedLabelsJson: Record<string, string> = {};
    const labelMap = new Map<string, Label>();
    for (const label of labels) {
      if (label && label.name) {
        labelMap.set(label.name, label);
        const key = toCamelCase(label.name);
        expectedLabelsJson[key] = String(label.value || '');
      }
    }

    // Compare local file with expected content
    const differences: string[] = [];
    
    // Check for modified values
    for (const [labelName, labelMeta] of Object.entries(metadata.labels)) {
      if (!labelName) continue; // Skip invalid keys
      
      const label = labelMap.get(labelName);
      if (!label) continue;
      
      const camelKey = toCamelCase(labelName);
      const expectedValue = String(label.value !== undefined && label.value !== null ? label.value : '');
      const actualValue = currentLabelsJson[camelKey];
      
      // If value in local file doesn't match expected value, it was manually edited
      // But only if the version hasn't changed (version change means cloud update)
      if (actualValue !== undefined && actualValue !== expectedValue && label.version === labelMeta.version) {
        differences.push(`"${labelName}" value changed (expected: "${expectedValue}", found: "${actualValue}")`);
      }
      
      // Check checksum to detect any other changes
      const expectedChecksum = labelMeta.checksum;
      const actualChecksum = calculateLabelChecksum(label);
      
      // If checksum doesn't match and version is the same, something was manually edited
      if (expectedChecksum !== actualChecksum && label.version === labelMeta.version) {
        if (!differences.some(d => d.includes(labelName))) {
          differences.push(`"${labelName}" has been modified`);
        }
      }
    }

    // Check for extra labels in local file (manually added)
    for (const [camelKey, value] of Object.entries(currentLabelsJson)) {
      const found = Array.from(labelMap.values()).find(
        l => toCamelCase(l.name || '') === camelKey
      );
      if (!found) {
        differences.push(`Extra label "${camelKey}" found in local file (not in cloud)`);
      }
    }

    // Check for missing labels (manually deleted)
    for (const [labelName, labelMeta] of Object.entries(metadata.labels)) {
      const camelKey = toCamelCase(labelName);
      if (currentLabelsJson[camelKey] === undefined) {
        differences.push(`Label "${labelName}" missing from local file (may have been deleted)`);
      }
    }

    if (differences.length > 0) {
      return {
        isEdited: true,
        reason: differences.slice(0, 3).join('; ') + (differences.length > 3 ? ` (and ${differences.length - 3} more)` : ''),
      };
    }

    return { isEdited: false };
  } catch (error) {
    // If we can't read or parse the file, assume it's been manually edited
    return {
      isEdited: true,
      reason: 'Could not verify label integrity - file may be corrupted or manually edited',
    };
  }
}

/**
 * Convert kebab-case to camelCase (helper for detectManualEdits)
 */
function toCamelCase(str: string): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str
    .replace(/[^a-zA-Z0-9-]/g, '')
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[A-Z]/, (match) => match.toLowerCase());
}

