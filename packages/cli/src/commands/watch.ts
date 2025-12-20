import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabels } from '../utils/api.js';
import { getMetadata, saveMetadata } from '../utils/metadata.js';
import { writeAllLabels } from '../utils/generator.js';

interface WatchOptions {
  interval?: number;
}

export async function watchCommand(options: WatchOptions): Promise<void> {
  const interval = options.interval || 30; // Default 30 seconds
  const spinner = ora('Starting watch mode...').start();

  try {
    // Check if metadata exists
    const metadata = await getMetadata();
    if (!metadata) {
      spinner.fail(chalk.red('No sync metadata found'));
      console.log();
      console.log(chalk.dim('Run "taggr pull --all" first to sync labels.'));
      process.exit(1);
    }

    // Initialize API
    const config = await requireAuth();
    initApi(config);

    spinner.succeed(chalk.green('Watch mode started'));
    console.log();
    console.log(chalk.dim(`Watching for label changes (checking every ${interval} seconds)...`));
    console.log(chalk.dim('Press Ctrl+C to stop'));
    console.log();

    let lastChecksum = metadata.overallChecksum;
    let iteration = 0;

    // Watch loop
    const watchInterval = setInterval(async () => {
      iteration++;
      const checkSpinner = ora(`Checking for changes... (${iteration})`).start();

      try {
        // Get current labels from API
        const labelsResponse = await getLabels();
        
        if (!labelsResponse || !labelsResponse.labels) {
          checkSpinner.fail(chalk.red('Failed to fetch labels'));
          return;
        }

        const { labels } = labelsResponse;

        // Calculate current checksum
        const currentMetadata = await getMetadata();
        if (!currentMetadata) {
          checkSpinner.stop();
          return;
        }

        // Compare versions
        const outdated: Array<{ name: string; oldVersion: string; newVersion: string }> = [];
        const newLabels: string[] = [];

        for (const label of labels) {
          const localMeta = currentMetadata.labels[label.name];
          if (!localMeta) {
            newLabels.push(label.name);
          } else if (localMeta.version !== label.version) {
            outdated.push({
              name: label.name,
              oldVersion: localMeta.version,
              newVersion: label.version,
            });
          }
        }

        // Check for deleted labels
        const deleted: string[] = [];
        for (const labelName of Object.keys(currentMetadata.labels)) {
          if (!labels.find(l => l.name === labelName)) {
            deleted.push(labelName);
          }
        }

        // If there are changes, pull and notify
        if (outdated.length > 0 || newLabels.length > 0 || deleted.length > 0) {
          checkSpinner.stop();
          console.log();
          console.log(chalk.yellow('⚠ Label changes detected!'));

          if (outdated.length > 0) {
            console.log();
            console.log(chalk.yellow(`  ${outdated.length} label(s) updated:`));
            for (const change of outdated) {
              console.log(
                `    ${chalk.white(change.name)}: ` +
                `${chalk.red(change.oldVersion)} → ${chalk.green(change.newVersion)}`
              );
            }
          }

          if (newLabels.length > 0) {
            console.log();
            console.log(chalk.green(`  ${newLabels.length} new label(s):`));
            for (const labelName of newLabels) {
              console.log(`    ${chalk.white(labelName)}`);
            }
          }

          if (deleted.length > 0) {
            console.log();
            console.log(chalk.red(`  ${deleted.length} label(s) deleted:`));
            for (const labelName of deleted) {
              console.log(`    ${chalk.white(labelName)}`);
            }
          }

          // Pull updated labels
          console.log();
          const pullSpinner = ora('Pulling updated labels...').start();
          try {
            await writeAllLabels(labels, config.apiUrl);
            pullSpinner.succeed(chalk.green('Labels updated successfully!'));
            console.log();
          } catch (error: any) {
            pullSpinner.fail(chalk.red('Failed to update labels'));
            console.error(chalk.red(`Error: ${error.message}`));
          }
        } else {
          checkSpinner.succeed(chalk.dim('No changes detected'));
        }
      } catch (error: any) {
        checkSpinner.fail(chalk.red('Check failed'));
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }, interval * 1000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(watchInterval);
      console.log();
      console.log(chalk.dim('Watch mode stopped'));
      process.exit(0);
    });

    // Keep process alive
    process.on('SIGTERM', () => {
      clearInterval(watchInterval);
      process.exit(0);
    });
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to start watch mode'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

