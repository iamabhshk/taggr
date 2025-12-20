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
import { checkCommand } from './commands/check.js';
import { watchCommand } from './commands/watch.js';
import { statusCommand } from './commands/status.js';

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
  .option('-u, --url <url>', 'API URL (default: https://taggr.onrender.com/api)')
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

// Check command
program
  .command('check')
  .description('Check if labels are up-to-date')
  .option('--strict', 'Fail if labels are outdated (for CI/CD)')
  .option('--fix', 'Show fix instructions')
  .action(checkCommand);

// Watch command
program
  .command('watch')
  .description('Watch for label changes and auto-sync')
  .option('-i, --interval <seconds>', 'Poll interval in seconds', '30')
  .action((options) => {
    watchCommand({ interval: parseInt(options.interval) || 30 });
  });

// Status command
program
  .command('status')
  .description('Show sync status and label versions')
  .action(statusCommand);

// Sync command (alias for pull --all)
program
  .command('sync')
  .description('Force sync all labels (alias for pull --all)')
  .action(async () => {
    const { pullCommand } = await import('./commands/pull.js');
    await pullCommand(undefined, { all: true });
  });


// Help styling
program.addHelpText('after', `
${chalk.bold('Examples:')}
  ${chalk.dim('$')} taggr login YOUR_API_KEY     ${chalk.dim('# Authenticate with API key')}
  ${chalk.dim('$')} taggr list                   ${chalk.dim('# List all your labels')}
  ${chalk.dim('$')} taggr pull --all             ${chalk.dim('# Pull all labels')}
  ${chalk.dim('$')} taggr check                  ${chalk.dim('# Check if labels are up-to-date')}
  ${chalk.dim('$')} taggr check --strict         ${chalk.dim('# Fail build if outdated (CI/CD)')}
  ${chalk.dim('$')} taggr watch                  ${chalk.dim('# Auto-sync on changes')}
  ${chalk.dim('$')} taggr status                 ${chalk.dim('# Show sync status')}
  ${chalk.dim('$')} taggr whoami                 ${chalk.dim('# Show current user')}

${chalk.bold('After pulling, import your labels:')}
  ${chalk.white("import labels from './taggr/labels.json';")}
  ${chalk.white('console.log(labels.myLabel);')}
`);

program.parse();

