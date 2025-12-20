import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, whoami } from '../utils/api.js';

export async function whoamiCommand(): Promise<void> {
  const spinner = ora('Fetching user info...').start();

  try {
    const config = await requireAuth();
    initApi(config);

    const whoamiResponse = await whoami();
    
    if (!whoamiResponse || !whoamiResponse.user) {
      throw new Error('Invalid response from server: user data not found');
    }
    
    const { user } = whoamiResponse;

    // Validate user object has required properties
    if (!user.uid || !user.email) {
      throw new Error('Invalid user data: missing required fields (uid, email)');
    }

    spinner.stop();
    console.log();
    console.log(chalk.bold('Logged in as:'));
    console.log();
    console.log(chalk.dim('  Name:   ') + chalk.white(user.displayName || 'Not set'));
    console.log(chalk.dim('  Email:  ') + chalk.white(user.email || 'Not set'));
    console.log(chalk.dim('  UID:    ') + chalk.white(user.uid || 'Not set'));
    
    // Safely access stats
    const totalLabels = user.stats?.totalLabels ?? 0;
    console.log(chalk.dim('  Labels: ') + chalk.white(totalLabels.toString()));
    
    // Safely format date
    let joinedDate = 'Unknown';
    if (user.createdAt) {
      try {
        joinedDate = new Date(user.createdAt).toLocaleDateString();
      } catch {
        joinedDate = 'Invalid date';
      }
    }
    console.log(chalk.dim('  Joined: ') + chalk.white(joinedDate));
    console.log();
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch user info'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

