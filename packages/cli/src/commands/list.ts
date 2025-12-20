import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, getLabels } from '../utils/api.js';

export async function listCommand(): Promise<void> {
  const spinner = ora('Fetching labels...').start();

  try {
    const config = await requireAuth();
    initApi(config);

    const labelsResponse = await getLabels();
    
    if (!labelsResponse || !labelsResponse.labels || typeof labelsResponse.count !== 'number') {
      throw new Error('Invalid response from server: labels data not found');
    }
    
    const { labels, count } = labelsResponse;

    spinner.stop();

    if (count === 0) {
      console.log(chalk.yellow('\nNo labels found.'));
      console.log(chalk.dim('Create labels at https://taggr.dev'));
      return;
    }

    console.log();
    console.log(chalk.bold(`Your Labels (${count}):`));
    console.log();

    for (const label of labels) {
      const status = label.isPublished 
        ? chalk.green('●') 
        : chalk.yellow('○');
      
      const labelName = label.name || 'Unnamed';
      const labelVersion = label.version || '0.0.0';
      console.log(`  ${status} ${chalk.white(labelName)} ${chalk.dim(`v${labelVersion}`)}`);
      
      if (label.description && typeof label.description === 'string') {
        const desc = label.description.substring(0, 60);
        console.log(chalk.dim(`    ${desc}${label.description.length > 60 ? '...' : ''}`));
      }
    }

    console.log();
    console.log(chalk.dim('● Published  ○ Draft'));
    console.log();
    console.log(chalk.dim('Use "taggr pull <name>" to download a label.'));
    console.log(chalk.dim('Use "taggr pull --all" to download all labels.'));
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch labels'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

