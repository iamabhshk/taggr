import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabelVersions } from '../utils/api.js';
import { getMetadata } from '../utils/metadata.js';

interface CheckOptions {
  strict?: boolean;
  fix?: boolean;
}

interface OutdatedLabel {
  name: string;
  localVersion: string;
  remoteVersion: string;
}

export async function checkCommand(options: CheckOptions): Promise<void> {
  // In CI mode (when CI environment variable is set), be silent
  const isCI = process.env.CI === 'true' || process.env.CI === '1';
  const spinner = isCI ? null : ora('Checking label versions...').start();

  try {
    if (!isCI && spinner) {
      spinner.text = 'Checking label versions...';
    }
    // Check if metadata exists
    const metadata = await getMetadata();
    if (!metadata) {
      if (spinner) {
        spinner.fail(chalk.red('No sync metadata found'));
        console.log();
        console.log(chalk.dim('Labels have not been synced yet. Run "taggr pull --all" first.'));
      } else {
        console.error('No sync metadata found. Run "taggr pull --all" first.');
      }
      if (options.strict) {
        process.exit(1);
      }
      return;
    }

    // Initialize API
    const config = await requireAuth();
    initApi(config);

    // Get current versions from API
    if (spinner) {
      spinner.text = 'Fetching current label versions...';
    }
    const remoteVersions = await getLabelVersions();

    // Compare local vs remote versions
    const outdated: OutdatedLabel[] = [];
    const missing: string[] = [];
    const extra: string[] = [];

    // Check each label in metadata
    for (const [labelName, labelMeta] of Object.entries(metadata.labels)) {
      const remoteVersion = remoteVersions[labelName];
      if (!remoteVersion) {
        // Label exists locally but not remotely (might have been deleted)
        extra.push(labelName);
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

    if (spinner) {
      spinner.stop();
    }

    // Display results
    if (outdated.length === 0 && missing.length === 0 && extra.length === 0) {
      if (!isCI) {
        console.log();
        console.log(chalk.green('✓ All labels are up-to-date!'));
        console.log();
      }
      return;
    }

    // Show outdated labels
    if (outdated.length > 0) {
      if (isCI) {
        console.error(`Outdated labels: ${outdated.map(l => `${l.name} (${l.localVersion} → ${l.remoteVersion})`).join(', ')}`);
      } else {
        console.log();
        console.log(chalk.yellow(`⚠ Found ${outdated.length} outdated label(s):`));
        console.log();
        for (const label of outdated) {
          console.log(
            `  ${chalk.white(label.name)}: ` +
            `${chalk.red(label.localVersion)} → ${chalk.green(label.remoteVersion)}`
          );
        }
      }
    }

    // Show missing labels
    if (missing.length > 0) {
      if (isCI) {
        console.error(`Missing labels: ${missing.join(', ')}`);
      } else {
        console.log();
        console.log(chalk.yellow(`⚠ Found ${missing.length} new label(s) not in local files:`));
        console.log();
        for (const labelName of missing) {
          console.log(`  ${chalk.white(labelName)}`);
        }
      }
    }

    // Show extra labels (only in non-CI mode)
    if (extra.length > 0 && !isCI) {
      console.log();
      console.log(chalk.dim(`ℹ ${extra.length} label(s) exist locally but not in cloud:`));
      console.log();
      for (const labelName of extra) {
        console.log(chalk.dim(`  ${labelName}`));
      }
    }

    if (!isCI) {
      console.log();
    }

    // Handle --fix option
    if (options.fix) {
      if (!isCI) {
        console.log(chalk.dim('Run "taggr pull --all" to update your labels.'));
        console.log();
      }
      if (options.strict) {
        process.exit(1);
      }
      return;
    }

    // Handle --strict option
    if (options.strict) {
      if (!isCI) {
        console.log(chalk.red('Labels are outdated. Build failed.'));
        console.log();
        console.log(chalk.dim('To fix:'));
        console.log(chalk.dim('  taggr pull --all'));
        console.log();
      } else {
        console.error('Labels are outdated. Run "taggr pull --all" to update.');
      }
      process.exit(1);
    }

    // Non-strict mode - just warn
    if (!isCI) {
      console.log(chalk.dim('Run "taggr pull --all" to update your labels.'));
      console.log(chalk.dim('Use --strict flag to fail builds when labels are outdated.'));
      console.log();
    }
  } catch (error: any) {
    if (spinner) {
      spinner.fail(chalk.red('Check failed'));
      console.error(chalk.red(`\nError: ${error.message}`));
    } else {
      console.error(`Error: ${error.message}`);
    }
    if (options.strict) {
      process.exit(1);
    }
    process.exit(1);
  }
}

