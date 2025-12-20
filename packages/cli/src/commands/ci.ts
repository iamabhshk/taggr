import chalk from 'chalk';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabelVersions } from '../utils/api.js';
import { getMetadata } from '../utils/metadata.js';

interface CiOptions {
  check?: boolean;
}

/**
 * CI-friendly check command (silent, exit codes only)
 */
export async function ciCommand(options: CiOptions): Promise<void> {
  try {
    // Check if metadata exists
    const metadata = await getMetadata();
    if (!metadata) {
      console.error('No sync metadata found. Run "taggr pull --all" first.');
      process.exit(1);
    }

    // Initialize API
    const config = await requireAuth();
    initApi(config);

    // Get current versions from API
    const remoteVersions = await getLabelVersions();

    // Compare local vs remote versions
    const outdated: Array<{ name: string; localVersion: string; remoteVersion: string }> = [];
    const missing: string[] = [];

    // Check each label in metadata
    for (const [labelName, labelMeta] of Object.entries(metadata.labels)) {
      const remoteVersion = remoteVersions[labelName];
      if (!remoteVersion) {
        // Label exists locally but not remotely
        continue;
      } else if (labelMeta.version !== remoteVersion) {
        outdated.push({
          name: labelName,
          localVersion: labelMeta.version,
          remoteVersion,
        });
      }
    }

    // Check for new labels
    for (const labelName of Object.keys(remoteVersions)) {
      if (!metadata.labels[labelName]) {
        missing.push(labelName);
      }
    }

    // Exit with error if outdated or missing
    if (outdated.length > 0 || missing.length > 0) {
      if (outdated.length > 0) {
        console.error(`Outdated labels: ${outdated.map(l => l.name).join(', ')}`);
      }
      if (missing.length > 0) {
        console.error(`Missing labels: ${missing.join(', ')}`);
      }
      console.error('Run "taggr pull --all" to update labels.');
      process.exit(1);
    }

    // All good
    process.exit(0);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

