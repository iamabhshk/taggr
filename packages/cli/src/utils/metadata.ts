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
  const data = `${label.name}:${label.value}:${label.version}`;
  return calculateChecksum(data);
}

/**
 * Calculate overall checksum for all labels
 */
function calculateOverallChecksum(labels: Label[]): string {
  const sortedLabels = [...labels].sort((a, b) => a.name.localeCompare(b.name));
  const data = sortedLabels
    .map(label => `${label.name}:${label.value}:${label.version}`)
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
        return content as TaggrMetadata;
      }
    }
    return null;
  } catch (error) {
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
  const now = new Date().toISOString();
  const labelMetadata: Record<string, LabelMetadata> = {};

  // Create metadata for each label
  for (const label of labels) {
    const key = label.name;
    labelMetadata[key] = {
      version: label.version,
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
  const existing = await getMetadata() || {
    syncedAt: new Date().toISOString(),
    apiUrl,
    labels: {},
    overallChecksum: '',
  };

  const now = new Date().toISOString();
  existing.labels[label.name] = {
    version: label.version,
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
 */
export async function detectManualEdits(
  labels: Label[]
): Promise<{ isEdited: boolean; reason?: string }> {
  const metadata = await getMetadata();
  if (!metadata) {
    // No metadata means this might be a fresh install or manually created file
    return { isEdited: false };
  }

  const labelsJsonPath = path.join(OUTPUT_DIR, 'labels.json');
  if (!(await fs.pathExists(labelsJsonPath))) {
    return { isEdited: false };
  }

  try {
    const currentContent = await fs.readFile(labelsJsonPath, 'utf-8');
    const currentLabels = JSON.parse(currentContent);
    
    // Check if any label in metadata is missing or changed
    for (const [labelName, labelMeta] of Object.entries(metadata.labels)) {
      const currentLabel = labels.find(l => l.name === labelName);
      if (!currentLabel) {
        // Label exists in metadata but not in current labels
        // This could mean it was deleted manually
        continue;
      }

      // Check if version changed (but this is expected on sync)
      // We'll check checksum instead
      const expectedChecksum = labelMeta.checksum;
      const actualChecksum = calculateLabelChecksum(currentLabel);
      
      // If checksum doesn't match and it's not a version update, it was manually edited
      if (expectedChecksum !== actualChecksum && currentLabel.version === labelMeta.version) {
        return {
          isEdited: true,
          reason: `Label "${labelName}" has been manually modified`,
        };
      }
    }

    // Check overall checksum
    const expectedOverall = metadata.overallChecksum;
    const actualOverall = calculateOverallChecksum(labels);
    
    if (expectedOverall && expectedOverall !== actualOverall) {
      // This could be due to new labels or removed labels, not necessarily manual edits
      // We'll be lenient here and only flag if we're sure
      return { isEdited: false };
    }

    return { isEdited: false };
  } catch (error) {
    // If we can't read or parse the file, assume it's been manually edited
    return {
      isEdited: true,
      reason: 'Could not verify label integrity',
    };
  }
}

