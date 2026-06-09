/**
 * Console output helpers + the Master "voice".
 *
 * A few tasteful nods to Masters of the Universe live here (banner + the hidden
 * `master power` command). They never affect generated code — only what the CLI
 * prints. By the power of Grayskull!
 */
import pc from 'picocolors';

export const log = {
  /** Plain line. */
  info(message: string): void {
    console.log(message);
  },
  /** Green success line with a check. */
  success(message: string): void {
    console.log(`${pc.green('✔')} ${message}`);
  },
  /** Yellow warning line. */
  warn(message: string): void {
    console.log(`${pc.yellow('!')} ${message}`);
  },
  /** Red error line (stderr). */
  error(message: string): void {
    console.error(`${pc.red('✖')} ${message}`);
  },
  /** Dim secondary line. */
  dim(message: string): void {
    console.log(pc.dim(message));
  },
  /** Cyan step/heading line. */
  step(message: string): void {
    console.log(`${pc.cyan('›')} ${message}`);
  },
  /** A created-file line, indented. */
  created(relPath: string): void {
    console.log(`  ${pc.green('create')}  ${relPath}`);
  },
  /** An updated-file line, indented. */
  updated(relPath: string): void {
    console.log(`  ${pc.yellow('update')}  ${relPath}`);
  },
};

/** The banner shown by `master`, `master help`, and `master info`. */
export function banner(version: string): string {
  return [
    '',
    pc.bold(pc.cyan('  ███╗   ███╗ █████╗ ███████╗████████╗███████╗██████╗ ')),
    pc.bold(pc.cyan('  ████╗ ████║██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗')),
    pc.bold(pc.cyan('  ██╔████╔██║███████║███████╗   ██║   █████╗  ██████╔╝')),
    pc.bold(pc.cyan('  ██║╚██╔╝██║██╔══██║╚════██║   ██║   ██╔══╝  ██╔══██╗')),
    pc.bold(pc.cyan('  ██║ ╚═╝ ██║██║  ██║███████║   ██║   ███████╗██║  ██║')),
    pc.bold(pc.cyan('  ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝')),
    '',
    `  ${pc.bold('Master')} ${pc.dim('v' + version)} ${pc.dim('— the most powerful CLI in the universe')}`,
    `  ${pc.dim('Next.js frontend · MasterController API · MasterRecord ORM')}`,
    '',
  ].join('\n');
}

/** Hidden easter egg printed by `master power`. */
export function grayskull(): string {
  return [
    '',
    pc.bold(pc.yellow('  ⚡  By the power of Grayskull...  ⚡')),
    pc.bold(pc.green('      I HAVE THE POWER!')),
    '',
    pc.dim('  You wield the Master framework. Use it for good.'),
    '',
  ].join('\n');
}
