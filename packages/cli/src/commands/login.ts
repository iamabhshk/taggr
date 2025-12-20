import chalk from 'chalk';
import ora from 'ora';
import { saveConfig, getConfig } from '../utils/config.js';
import { initApi, whoami } from '../utils/api.js';

// Default to production API URL, fallback to localhost for development
const DEFAULT_API_URL = process.env.TAGGR_API_URL || 'https://taggr-lab.vercel.app/api';

export async function loginCommand(apiKey: string, options: { url?: string }): Promise<void> {
  const spinner = ora('Verifying API key...').start();

  try {
    const apiUrl = options.url || DEFAULT_API_URL;

    // Initialize API with the provided key
    initApi({ apiKey, apiUrl });

    // Verify the API key by calling whoami
    const { user } = await whoami();

    // Save config
    await saveConfig({ apiKey, apiUrl });

    spinner.succeed(chalk.green('Successfully logged in!'));
    console.log();
    console.log(chalk.dim('  User:  ') + chalk.white(user.displayName || user.email));
    console.log(chalk.dim('  Email: ') + chalk.white(user.email));
    console.log(chalk.dim('  Labels: ') + chalk.white(user.stats.totalLabels.toString()));
    console.log();
    console.log(chalk.dim('You can now use "taggr pull" to fetch your labels.'));
  } catch (error: any) {
    spinner.fail(chalk.red('Login failed'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

