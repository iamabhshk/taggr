#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loginCommand } from './commands/login.js';
import { logoutCommand } from './commands/logout.js';
import { whoamiCommand } from './commands/whoami.js';
import { listCommand } from './commands/list.js';
import { pullCommand } from './commands/pull.js';

// Read version from package.json
// When installed globally: node_modules/@taggr/cli/dist/index.js -> ../package.json
// When in development: packages/cli/dist/index.js -> ../package.json
let version = '1.0.1'; // fallback version
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const packageJsonPath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  version = packageJson.version || version;
} catch {
  // If package.json can't be read, use fallback version
  // This can happen in some edge cases, but shouldn't affect functionality
}

const program = new Command();

program
  .name('taggr')
  .description('CLI tool for Taggr - Pull and manage your labels locally')
  .version(version);

// Login command
program
  .command('login <api-key>')
  .description('Authenticate with your Taggr API key')
  .option('-u, --url <url>', 'API URL (default: https://taggr-lab.vercel.app/api)')
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

