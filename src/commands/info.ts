/**
 * `master info` — print the banner + environment details, and the hidden
 * `master power` easter egg. Pure presentation; no project required.
 */
import { banner, grayskull, log } from '../lib/log.js';
import pc from 'picocolors';
import { findProjectRoot } from '../lib/paths.js';

export function runInfo(version: string): void {
  log.info(banner(version));
  log.info(`  ${pc.bold('node')}     ${process.version}`);
  log.info(`  ${pc.bold('platform')} ${process.platform} (${process.arch})`);
  const root = findProjectRoot();
  log.info(`  ${pc.bold('project')}  ${root ?? pc.dim('(not inside a Master project)')}`);
  log.info('');
  log.dim('  Run `master help` for the full command list.');
  log.info('');
}

export function runPower(): void {
  log.info(grayskull());
}
