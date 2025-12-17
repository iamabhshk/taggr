import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabels, getLabelByName } from '../utils/api.js';
import { writeLabelFile, writeAllLabels, updateIndexFile } from '../utils/generator.js';
import type { Label } from '../types.js';

interface PullOptions {
  all?: boolean;
}

export async function pullCommand(name: string | undefined, options: PullOptions): Promise<void> {
  const spinner = ora('Connecting to Taggr...').start();

  try {
    const config = await requireAuth();
    initApi(config);

    if (options.all) {
      // Pull all labels
      spinner.text = 'Fetching all labels...';
      const { labels, count } = await getLabels();

      if (count === 0) {
        spinner.warn(chalk.yellow('No labels found.'));
        console.log(chalk.dim('Create labels at https://taggr.dev'));
        return;
      }

      spinner.text = `Writing ${count} label(s)...`;
      const files = await writeAllLabels(labels);

      spinner.succeed(chalk.green(`Pulled ${count} label(s) successfully!`));
      console.log();
      console.log(chalk.dim('Files created:'));
      for (const file of files) {
        console.log(chalk.dim(`  ${file}`));
      }
      console.log();
      printUsageInstructions(labels);
    } else if (name) {
      // Pull single label
      spinner.text = `Fetching label "${name}"...`;
      const { label } = await getLabelByName(name);

      spinner.text = 'Writing file...';
      const filePath = await writeLabelFile(label);

      // Update files to include this label
      const { labels: allLabels } = await getLabels();
      await updateIndexFile(allLabels);

      spinner.succeed(chalk.green(`Pulled "${label.name}" successfully!`));
      console.log();
      console.log(chalk.dim('File updated:'));
      console.log(chalk.dim(`  ${filePath}`));
      console.log();
      printUsageInstructions([label]);
    } else {
      spinner.fail(chalk.red('Please specify a label name or use --all'));
      console.log();
      console.log(chalk.dim('Usage:'));
      console.log(chalk.dim('  taggr pull <label-name>   Pull a specific label'));
      console.log(chalk.dim('  taggr pull --all          Pull all labels'));
      process.exit(1);
    }
  } catch (error: any) {
    spinner.fail(chalk.red('Pull failed'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

function printUsageInstructions(labels: Label[]): void {
  console.log(chalk.bold('Usage:'));
  console.log();

  if (labels.length === 1) {
    const label = labels[0];
    const varName = toCamelCase(label.name);
    console.log(chalk.dim('  // Import labels'));
    console.log(chalk.white(`  import labels from './taggr/labels.json';`));
    console.log();
    console.log(chalk.dim('  // Use the value'));
    console.log(chalk.white(`  console.log(labels.${varName});`));
  } else {
    console.log(chalk.dim('  // Import labels'));
    console.log(chalk.white(`  import labels from './taggr/labels.json';`));
    console.log();
    console.log(chalk.dim('  // Use the values'));
    const firstLabel = labels[0];
    console.log(chalk.white(`  console.log(labels.${toCamelCase(firstLabel.name)});`));
  }
  console.log();
}

function toCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}
