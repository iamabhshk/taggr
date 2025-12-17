#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { listCommand } from './commands/list.js';
import { pullCommand } from './commands/pull.js';

const program = new Command();

program
  .name('taggr')
  .description('CLI tool for Taggr - Pull and manage your labels locally')
  .version('1.0.0');

// Login command
program
  .command('login <api-key>')
  .description('Authenticate with your Taggr API key')
  .option('-u, --url <url>', 'API URL (default: http://localhost:5000/api)')
  .action(loginCommand);

// Logout command
program
  .command('logout')
  .description('Remove saved API key')
  .action(logoutCommand);

// Whoami command
program
  .command('whoami')
  .description('Show current authenticated user')
  .action(whoamiCommand);

// List command
program
  .command('list')
  .alias('ls')
  .description('List all your labels')
  .action(listCommand);

// Pull command
program
  .command('pull [name]')
  .description('Pull label(s) and generate local files')
  .option('-a, --all', 'Pull all labels')
  .action(pullCommand);

// Help styling
program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.dim('$')} taggr login YOUR_API_KEY     ${chalk.dim('# Authenticate with API key')}
  ${chalk.dim('$')} taggr list                   ${chalk.dim('# List all your labels')}
  ${chalk.dim('$')} taggr pull my-label          ${chalk.dim('# Pull a specific label')}
  ${chalk.dim('$')} taggr pull --all             ${chalk.dim('# Pull all labels')}
  ${chalk.dim('$')} taggr whoami                 ${chalk.dim('# Show current user')}
  ${chalk.dim('$')} taggr logout                 ${chalk.dim('# Remove saved credentials')}

${chalk.bold('After pulling, import your labels:')}
  ${chalk.white("import myLabel from './taggr/my-label.js';")}
  ${chalk.white('console.log(myLabel.value);')}
`);

program.parse();

