import chalk from 'chalk';
import { getMetadata, detectManualEdits } from '../utils/metadata.js';
import { getOutputDir } from '../utils/generator.js';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabels } from '../utils/api.js';
import fs from 'fs-extra';
import path from 'path';

export async function statusCommand(): Promise<void> {
  try {
    const metadata = await getMetadata();
    
    if (!metadata) {
      console.log(chalk.yellow('No sync metadata found'));
      console.log();
      console.log(chalk.dim('Run "taggr pull --all" to sync labels.'));
      return;
    }

    console.log();
    console.log(chalk.bold('Taggr Sync Status'));
    console.log();

    // Show sync info
    const syncedDate = new Date(metadata.syncedAt);
    console.log(chalk.dim('  Last synced: ') + chalk.white(syncedDate.toLocaleString()));
    console.log(chalk.dim('  API URL:     ') + chalk.white(metadata.apiUrl));
    console.log();

    // Count labels
    const labelCount = Object.keys(metadata.labels).length;
    console.log(chalk.dim(`  Labels:       ${chalk.white(labelCount.toString())}`));
    console.log();

    // Show label versions
    if (labelCount > 0) {
      console.log(chalk.bold('Label Versions:'));
      console.log();
      
      const labels = Object.entries(metadata.labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(0, 10); // Show first 10

      for (const [name, meta] of labels) {
        const syncedDate = new Date(meta.syncedAt);
        console.log(
          `  ${chalk.white(name.padEnd(30))} ` +
          `${chalk.dim('v' + meta.version)} ` +
          `${chalk.dim('(' + syncedDate.toLocaleDateString() + ')')}`
        );
      }

      if (labelCount > 10) {
        console.log();
        console.log(chalk.dim(`  ... and ${labelCount - 10} more`));
      }
    }

    // Check if files exist
    console.log();
    const outputDir = getOutputDir();
    const labelsJsonPath = path.join(outputDir, 'labels.json');
    const labelsDtsPath = path.join(outputDir, 'labels.d.ts');
    const metadataPath = path.join(outputDir, '.taggr.json');

    console.log(chalk.bold('Files:'));
    console.log();
    console.log(
      `  ${await fs.pathExists(labelsJsonPath) ? chalk.green('✓') : chalk.red('✗')} ` +
      chalk.white('labels.json')
    );
    console.log(
      `  ${await fs.pathExists(labelsDtsPath) ? chalk.green('✓') : chalk.red('✗')} ` +
      chalk.white('labels.d.ts')
    );
    console.log(
      `  ${await fs.pathExists(metadataPath) ? chalk.green('✓') : chalk.red('✗')} ` +
      chalk.white('.taggr.json')
    );
    console.log();

    // Check for manual edits
    try {
      const config = await requireAuth();
      initApi(config);
      const labelsResponse = await getLabels();
      if (labelsResponse && labelsResponse.labels) {
        const manualEdit = await detectManualEdits(labelsResponse.labels);
        if (manualEdit.isEdited) {
          console.log(chalk.bold('⚠ Integrity Check:'));
          console.log();
          console.log(chalk.yellow(`  Warning: ${manualEdit.reason || 'Labels file may have been manually edited'}`));
          console.log();
          console.log(chalk.dim('  Manual edits will be overwritten on next "taggr pull --all"'));
          console.log();
        } else {
          console.log(chalk.bold('Integrity Check:'));
          console.log();
          console.log(chalk.green('  ✓ Labels file integrity verified'));
          console.log();
        }
      }
    } catch (error) {
      // Silently fail if we can't check (e.g., not logged in)
    }
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

