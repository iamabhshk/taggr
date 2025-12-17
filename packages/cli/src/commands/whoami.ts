import chalk from 'chalk';
import ora from 'ora';
import { requireAuth } from '../utils/config.js';
import { initApi, whoami } from '../utils/api.js';

export async function whoamiCommand(): Promise<void> {
  const spinner = ora('Fetching user info...').start();

  try {
    const config = await requireAuth();
    initApi(config);

    const { user } = await whoami();

    spinner.stop();
    console.log();
    console.log(chalk.bold('Logged in as:'));
    console.log();
    console.log(chalk.dim('  Name:   ') + chalk.white(user.displayName || 'Not set'));
    console.log(chalk.dim('  Email:  ') + chalk.white(user.email));
    console.log(chalk.dim('  UID:    ') + chalk.white(user.uid));
    console.log(chalk.dim('  Labels: ') + chalk.white(user.stats.totalLabels.toString()));
    console.log(chalk.dim('  Joined: ') + chalk.white(new Date(user.createdAt).toLocaleDateString()));
    console.log();
  } catch (error: any) {
    spinner.fail(chalk.red('Failed to fetch user info'));
    console.error(chalk.red(`\nError: ${error.message}`));
    process.exit(1);
  }
}

