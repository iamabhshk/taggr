import chalk from 'chalk';
import ora from 'ora';
import { saveConfig, getConfig } from '../utils/config.js';
import { initApi, whoami } from '../utils/api.js';

// Default to production API URL, fallback to localhost for development
const DEFAULT_API_URL = process.env.TAGGR_API_URL || 'https://taggr.onrender.com/api';

export async function loginCommand(apiKey: string, options: { url?: string }): Promise<void> {
  // Validate API key is provided
  if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
    console.error(chalk.red('Error: API key is required'));
    console.log();
    console.log(chalk.dim('Usage: taggr login <API_KEY> [--url <API_URL>]'));
    process.exit(1);
  }

  const spinner = ora('Verifying API key...').start();

  try {
    const apiUrl = options.url || DEFAULT_API_URL;

    // Initialize API with the provided key
    initApi({ apiKey, apiUrl });

    // Verify the API key by calling whoami
    const whoamiResponse = await whoami();
    
    if (!whoamiResponse || !whoamiResponse.user) {
      throw new Error('Invalid response from server: user data not found');
    }
    
    const { user } = whoamiResponse;

    // Validate user object has required properties
    if (!user.uid || !user.email) {
      throw new Error('Invalid user data: missing required fields (uid, email)');
    }

    // Save config
    await saveConfig({ apiKey, apiUrl });

    spinner.succeed(chalk.green('Successfully logged in!'));
    console.log();
    console.log(chalk.dim('  User:  ') + chalk.white(user.displayName || user.email || 'Not set'));
    console.log(chalk.dim('  Email: ') + chalk.white(user.email || 'Not set'));
    
    // Safely access stats
    const totalLabels = user.stats?.totalLabels ?? 0;
    console.log(chalk.dim('  Labels: ') + chalk.white(totalLabels.toString()));
    console.log();
    console.log(chalk.dim('You can now use "taggr pull" to fetch your labels.'));
  } catch (error: any) {
    spinner.fail(chalk.red('Login failed'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

