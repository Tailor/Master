#!/usr/bin/env node
/**
 * Master CLI entry point.
 *
 * Thin commander wiring only — every command's behavior lives in ./commands/*.
 * "The most powerful CLI in the universe." By the power of Grayskull!
 */
import { createRequire } from 'node:module';
import { Command } from 'commander';
import { runNew, type DbChoice } from './commands/new.js';
import { runGenerate, GENERATOR_TYPES } from './commands/generate.js';
import { runDev, runBuild, runStart } from './commands/run.js';
import { runDb, DB_ACTIONS } from './commands/db.js';
import { runSecrets, SECRETS_ACTIONS } from './commands/secrets.js';
import { runTest } from './commands/test.js';
import { runRoutes } from './commands/routes.js';
import { runInfo, runPower } from './commands/info.js';
import { banner } from './lib/log.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json') as { version: string };
const VERSION = pkg.version;

const program = new Command();

program
  .name('master')
  .description('The command center for the Master framework — scaffold and run full-stack apps.')
  .version(VERSION, '-v, --version', 'Output the Master CLI version')
  .addHelpText('beforeAll', banner(VERSION));

// master new <name>
program
  .command('new')
  .alias('n')
  .argument('<name>', 'name of the new application')
  .description('Create a new full-stack Master app (Next.js + MasterController + MasterRecord)')
  .option('--db <type>', 'database: sqlite | mysql | postgres', 'sqlite')
  .option('--skip-install', 'do not run npm install', false)
  .option('--skip-frontend', 'create a backend-only app (no Next.js)', false)
  .option('--skip-git', 'do not initialize a git repository', false)
  .action(async (name: string, opts) => {
    const db = ['sqlite', 'mysql', 'postgres'].includes(opts.db) ? (opts.db as DbChoice) : 'sqlite';
    await runNew(name, {
      db,
      skipInstall: !!opts.skipInstall,
      skipFrontend: !!opts.skipFrontend,
      skipGit: !!opts.skipGit,
    });
  });

// master generate <type> <name> [extra...]
program
  .command('generate')
  .alias('g')
  .argument('<type>', `what to generate: ${GENERATOR_TYPES.join(', ')}`)
  .argument('[name]', 'name of the artifact')
  .argument('[extra...]', 'actions / fields (e.g. title:string body:text)')
  .description('Generate controllers, models, scaffolds, sockets, middleware, components, pages')
  .action(async (type: string, name: string, extra: string[]) => {
    await runGenerate(type, name, extra ?? []);
  });

// master dev / build / start
program
  .command('dev')
  .alias('s')
  .description('Run the backend API and Next.js frontend together (development)')
  .action(runDev);

program.command('build').description('Build the app for production').action(runBuild);

program
  .command('start')
  .description('Run the backend API and Next.js frontend together (production)')
  .action(runStart);

// master db <action> [name]
program
  .command('db')
  .argument('<action>', `database action: ${DB_ACTIONS.join(', ')}`)
  .argument('[name]', 'migration name (for `db new`)')
  .option('--env <env>', 'environment (development | production | ...)')
  .option('-f, --force', 'db remove: revert the migration if it was applied, then remove it', false)
  .option('-o, --output <file>', 'db script: write the SQL to a file')
  .description('Run database migrations via MasterRecord (migrate, rollback, new, remove, status, script, …)')
  .action(async (action: string, name: string | undefined, opts) => {
    await runDb(action, name, { env: opts.env, force: !!opts.force, output: opts.output });
  });

// master secrets <action> [key] [value]
program
  .command('secrets')
  .argument('<action>', `secrets action: ${SECRETS_ACTIONS.join(', ')}`)
  .argument('[key]', 'configuration key, e.g. Auth:JwtSecret')
  .argument('[value]', 'value (for `secrets set`)')
  .option('--reveal', 'show values in `secrets list`', false)
  .option('--id <id>', 'secrets id (defaults to the backend package name)')
  .description('Manage development secrets stored outside the repo (the dotnet user-secrets equivalent)')
  .action(async (action: string, key: string | undefined, value: string | undefined, opts) => {
    await runSecrets(action, key, value, { reveal: !!opts.reveal, id: opts.id });
  });

// master test
program
  .command('test')
  .option('--frontend', 'also run the frontend test script', false)
  .option('--env <env>', 'NODE_ENV for the run (default: test)')
  .description('Run the backend (and optionally frontend) test suites')
  .action(async (opts) => {
    await runTest({ frontend: !!opts.frontend, env: opts.env });
  });

// master routes
program
  .command('routes')
  .description('List the routes registered in the backend')
  .action(runRoutes);

// master info / power
program
  .command('info')
  .description('Show framework + environment info')
  .action(() => runInfo(VERSION));
program
  .command('power', { hidden: true })
  .description('⚡ By the power of Grayskull')
  .action(runPower);

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

if (process.argv.slice(2).length === 0) {
  program.outputHelp();
}
