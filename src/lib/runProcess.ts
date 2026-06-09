/**
 * Long-running child-process orchestration for `master dev/build/start`.
 *
 * Uses execa to spawn frontend + backend processes, prefixes each line of their
 * output with a colored tag, and ties their lifecycle together so Ctrl-C (or one
 * crashing) tears the whole thing down cleanly.
 */
import { execa, type ResultPromise } from 'execa';
import pc from 'picocolors';

export interface ProcSpec {
  /** Short label used as the colored output prefix (e.g. "backend"). */
  label: string;
  /** Color function applied to the label. */
  color: (s: string) => string;
  /** Command to run. */
  command: string;
  /** Command arguments. */
  args: string[];
  /** Working directory. */
  cwd: string;
  /** Extra environment variables. */
  env?: Record<string, string>;
}

function prefixStream(
  label: string,
  color: (s: string) => string,
  chunk: Buffer,
  isError: boolean,
): void {
  const tag = color(`[${label}]`);
  const text = chunk.toString('utf8');
  for (const line of text.split('\n')) {
    if (line.length === 0) continue;
    const out = `${tag} ${line}`;
    if (isError) process.stderr.write(out + '\n');
    else process.stdout.write(out + '\n');
  }
}

/**
 * Run one or more processes concurrently until they exit or the user interrupts.
 * If any process exits, the rest are terminated. Resolves with the highest exit
 * code observed (0 when everything stops cleanly).
 */
export async function runConcurrent(specs: ProcSpec[]): Promise<number> {
  const children: ResultPromise[] = [];
  let shuttingDown = false;
  let exitCode = 0;

  const shutdown = (): void => {
    if (shuttingDown) return;
    shuttingDown = true;
    for (const child of children) {
      // execa force-kills after its default delay if SIGTERM is ignored.
      child.kill('SIGTERM');
    }
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  const runs = specs.map((spec) => {
    const child = execa(spec.command, spec.args, {
      cwd: spec.cwd,
      env: { ...process.env, FORCE_COLOR: '1', ...spec.env },
      stdout: 'pipe',
      stderr: 'pipe',
      reject: false,
    });
    children.push(child);
    child.stdout?.on('data', (c: Buffer) => prefixStream(spec.label, spec.color, c, false));
    child.stderr?.on('data', (c: Buffer) => prefixStream(spec.label, spec.color, c, true));

    return child.then((result) => {
      const code = typeof result.exitCode === 'number' ? result.exitCode : 0;
      if (code !== 0 && !shuttingDown) {
        process.stderr.write(pc.red(`[${spec.label}] exited with code ${code}\n`));
        exitCode = code;
      }
      shutdown();
    });
  });

  await Promise.all(runs);
  process.off('SIGINT', shutdown);
  process.off('SIGTERM', shutdown);
  return exitCode;
}

/**
 * Run a single command to completion, inheriting stdio (used for `db` commands
 * and one-shot build steps). Returns the exit code.
 */
export async function runOnce(
  command: string,
  args: string[],
  cwd: string,
  env: Record<string, string> = {},
): Promise<number> {
  const result = await execa(command, args, {
    cwd,
    env: { ...process.env, ...env },
    stdio: 'inherit',
    reject: false,
  });
  return typeof result.exitCode === 'number' ? result.exitCode : 0;
}
