/**
 * `master new <name>` — scaffold a fresh decoupled full-stack monorepo:
 *   <name>/backend   MasterController API + MasterRecord ORM
 *   <name>/frontend  Next.js App Router app
 *
 * Copies the packaged template, applies the chosen database, names the project,
 * optionally installs dependencies and initializes git.
 */
import fse from 'fs-extra';
import { existsSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { appTemplateDir } from '../lib/paths.js';
import { runOnce } from '../lib/runProcess.js';
import { log } from '../lib/log.js';
import { kebabCase } from '../lib/naming.js';

export type DbChoice = 'sqlite' | 'mysql' | 'postgres';

export interface NewOptions {
  db: DbChoice;
  skipInstall: boolean;
  skipFrontend: boolean;
  skipGit: boolean;
}

const CONTEXT_NAME = 'AppContext';

/** Build the env config (keyed by context name) for a database choice. */
export function envConfig(
  db: DbChoice,
  appName: string,
  env: 'development' | 'test' | 'production',
): string {
  const dbName = `${kebabCase(appName).replace(/-/g, '_')}_${env}`;
  let settings: Record<string, unknown>;
  if (db === 'sqlite') {
    // A separate SQLite file for the test environment (`master test` sets NODE_ENV=test).
    settings = { type: 'better-sqlite3', connection: env === 'test' ? 'db/test/' : 'db/' };
  } else if (db === 'mysql') {
    settings = {
      type: 'mysql',
      host: '127.0.0.1',
      port: 3306,
      database: dbName,
      user: 'root',
      password: '',
    };
  } else {
    settings = {
      type: 'postgres',
      host: '127.0.0.1',
      port: 5432,
      database: dbName,
      user: 'postgres',
      password: '',
    };
  }
  return JSON.stringify({ [CONTEXT_NAME]: settings }, null, 2) + '\n';
}

/** Rename packaged `gitignore` files to `.gitignore` (npm refuses to ship dotfiles named .gitignore). */
async function unhideGitignores(root: string): Promise<void> {
  for (const rel of ['gitignore', 'frontend/gitignore', 'backend/gitignore']) {
    const from = join(root, rel);
    if (existsSync(from)) await fse.move(from, join(root, rel.replace(/gitignore$/, '.gitignore')));
  }
}

/** Set the `name` field of a package.json if it exists. */
async function namePackage(file: string, name: string): Promise<void> {
  if (!existsSync(file)) return;
  const pkg = await fse.readJson(file);
  pkg.name = name;
  await fse.writeJson(file, pkg, { spaces: 2 });
}

export async function runNew(name: string, options: NewOptions): Promise<void> {
  if (!name) {
    log.error('You must provide a name:  master new <app-name>');
    process.exitCode = 1;
    return;
  }

  const target = resolve(process.cwd(), name);
  const appName = kebabCase(basename(target));

  if (existsSync(target)) {
    log.error(`Directory "${name}" already exists.`);
    process.exitCode = 1;
    return;
  }

  log.step(`Creating a new Master app in ${target}`);

  // 1. Copy the template.
  await fse.copy(appTemplateDir(), target);
  await unhideGitignores(target);
  log.success('Copied project template');

  // 2. Name the packages.
  await namePackage(join(target, 'package.json'), appName);
  await namePackage(join(target, 'backend', 'package.json'), `${appName}-backend`);
  await namePackage(join(target, 'frontend', 'package.json'), `${appName}-frontend`);

  // 3. Apply the database choice.
  const envDir = join(target, 'backend', 'config', 'environments');
  await fse.ensureDir(envDir);
  await fse.writeFile(
    join(envDir, 'env.development.json'),
    envConfig(options.db, appName, 'development'),
  );
  await fse.writeFile(
    join(envDir, 'env.production.json'),
    envConfig(options.db, appName, 'production'),
  );
  await fse.writeFile(join(envDir, 'env.test.json'), envConfig(options.db, appName, 'test'));
  log.success(`Configured database: ${options.db}`);

  // 4. Optionally drop the frontend.
  if (options.skipFrontend) {
    await fse.remove(join(target, 'frontend'));
    await fse.writeFile(
      join(target, 'master.config.js'),
      `// Master project configuration.\nexport default {\n  frontend: false,\n  backendPort: 3001,\n};\n`,
    );
    const rootPkg = await fse.readJson(join(target, 'package.json'));
    rootPkg.workspaces = ['backend'];
    await fse.writeJson(join(target, 'package.json'), rootPkg, { spaces: 2 });
    log.success('Skipped Next.js frontend (backend-only)');
  }

  // 5. Install dependencies.
  if (!options.skipInstall) {
    log.step('Installing dependencies (npm install)…');
    const code = await runOnce('npm', ['install'], target);
    if (code !== 0) log.warn('Dependency install failed — run `npm install` manually.');
    else log.success('Installed dependencies');
  } else {
    log.dim('  Skipped install (run `npm install` yourself).');
  }

  // 6. Initialize git.
  if (!options.skipGit && !existsSync(join(target, '.git'))) {
    await runOnce('git', ['init', '--quiet'], target);
    await runOnce('git', ['add', '-A'], target);
    log.success('Initialized git repository');
  }

  printNextSteps(name, options);
}

function printNextSteps(name: string, options: NewOptions): void {
  log.info('');
  log.success(`Your Master app is ready! ⚡`);
  log.info('');
  log.info('  Next steps:');
  log.info(`    cd ${name}`);
  if (options.skipInstall) log.info('    npm install');
  log.info('    master db migrate     # create the database schema');
  log.info('    master dev            # start backend + frontend');
  log.info('');
  log.dim('  By the power of Grayskull — happy building!');
}
