import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabels, getLabelByName } from '../utils/api.js';
import { writeLabelFile, writeAllLabels, updateIndexFile } from '../utils/generator.js';
import { detectManualEdits } from '../utils/metadata.js';
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
      const labelsResponse = await getLabels();
      
      if (!labelsResponse || !labelsResponse.labels || typeof labelsResponse.count !== 'number') {
        throw new Error('Invalid response from server: labels data not found');
      }
      
      const { labels, count } = labelsResponse;

      if (count === 0) {
        spinner.warn(chalk.yellow('No labels found.'));
        console.log(chalk.dim('Create labels at https://taggr.dev'));
        return;
      }

      // Check for manual edits
      spinner.text = 'Checking for manual edits...';
      const editCheck = await detectManualEdits(labels);
      if (editCheck.isEdited) {
        spinner.warn(chalk.yellow('Manual edits detected'));
        console.log();
        console.log(chalk.yellow(`⚠ Warning: ${editCheck.reason || 'Labels may have been manually edited'}`));
        console.log();
        console.log(chalk.dim('Pulling will overwrite your manual changes.'));
        console.log(chalk.dim('If you want to keep your changes, consider:'));
        console.log(chalk.dim('  1. Committing your changes to version control first'));
        console.log(chalk.dim('  2. Creating labels in the Taggr dashboard instead'));
        console.log();
      }

      spinner.text = `Writing ${count} label(s)...`;
      const files = await writeAllLabels(labels, config.apiUrl);

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
      const labelResponse = await getLabelByName(name);
      
      if (!labelResponse || !labelResponse.label) {
        throw new Error('Invalid response from server: label data not found');
      }
      
      const { label } = labelResponse;

      spinner.text = 'Writing file...';
      const filePath = await writeLabelFile(label, config.apiUrl);

      // Update files to include this label
      const allLabelsResponse = await getLabels();
      
      if (!allLabelsResponse || !allLabelsResponse.labels) {
        throw new Error('Invalid response from server: labels data not found');
      }
      
      const { labels: allLabels } = allLabelsResponse;
      await updateIndexFile(allLabels, config.apiUrl);

      const labelName = label.name || 'label';
      spinner.succeed(chalk.green(`Pulled "${labelName}" successfully!`));
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
    const labelName = label.name || 'label';
    const varName = toCamelCase(labelName);
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
    const labelName = firstLabel?.name || 'label';
    console.log(chalk.white(`  console.log(labels.${toCamelCase(labelName)});`));
  }
  console.log();
}

function toCamelCase(str: string): string {
  if (!str || typeof str !== 'string') {
    return 'label';
  }
  // Remove any invalid characters and convert to camelCase
  return str
    .replace(/[^a-zA-Z0-9-]/g, '') // Remove invalid characters
    .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
    .replace(/^[A-Z]/, (match) => match.toLowerCase()); // Ensure first letter is lowercase
}
