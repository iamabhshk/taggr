import chalk from 'chalk';
import { deleteConfig, isLoggedIn } from '../utils/config.js';

export async function logoutCommand(): Promise<void> {
  try {
    const loggedIn = await isLoggedIn();

    if (!loggedIn) {
      console.log(chalk.yellow('You are not logged in.'));
      return;
    }

    await deleteConfig();
    console.log(chalk.green('Successfully logged out.'));
  } catch (error: any) {
    console.error(chalk.red(`Error: ${error.message}`));
    process.exit(1);
  }
}

