/**
 * Pure source transforms for registering generated artifacts into existing
 * project files (`routes.js`, `models/context.js`). Kept string-in/string-out so
 * they can be unit-tested without touching disk.
 */

/** Insert `insertLine` immediately after the last source line matching `regex`. */
function insertAfterLast(source: string, regex: RegExp, insertLine: string): string | null {
  const matches = [...source.matchAll(regex)];
  const last = matches.at(-1);
  if (!last || last.index === undefined) return null;
  const end = last.index + last[0].length;
  const indent = last[0].match(/^[ \t]*/)?.[0] ?? '';
  return source.slice(0, end) + '\n' + indent + insertLine + source.slice(end);
}

/**
 * Append route registration lines to a `routes.js` source string, skipping any
 * line already present. Returns the new source.
 */
export function appendRoutes(source: string, lines: string[]): string {
  const existing = source.replace(/\s+$/, '');
  const toAdd = lines.filter((line) => !existing.includes(line.trim()));
  if (toAdd.length === 0) return source;
  return existing + '\n' + toAdd.join('\n') + '\n';
}

/**
 * Register a model in a MasterRecord context source: add an import after the last
 * import line and `this.dbset(<Model>);` after the last existing dbset (falling
 * back to right after `super();`). Idempotent. Returns the new source.
 */
export function registerModel(source: string, modelName: string): string {
  let result = source;

  const importLine = `import ${modelName} from './${modelName}.js';`;
  if (!result.includes(importLine)) {
    const afterImport = insertAfterLast(result, /^import .*$/gm, importLine);
    result = afterImport ?? importLine + '\n' + result;
  }

  if (!new RegExp(`this\\.dbset\\(\\s*${modelName}\\s*\\)`).test(result)) {
    const dbsetCall = `this.dbset(${modelName});`;
    const afterDbset = insertAfterLast(result, /^[ \t]*this\.dbset\(.*$/gm, dbsetCall);
    if (afterDbset) {
      result = afterDbset;
    } else {
      const afterSuper = insertAfterLast(result, /^[ \t]*super\(\);.*$/gm, dbsetCall);
      if (afterSuper) result = afterSuper;
    }
  }

  return result;
}
