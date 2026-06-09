/**
 * Naming helpers — the single source of truth for how names are transformed
 * across every generator. Kept pure (string in, string out) so they are trivial
 * to unit-test and impossible to couple to the filesystem.
 */

/** Lowercase the first character. `"User" -> "user"` */
export function lowerFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toLowerCase() + str.slice(1);
}

/** Uppercase the first character. `"user" -> "User"` */
export function upperFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/** Split an identifier of any case (kebab, snake, camel, Pascal, spaced) into words. */
export function words(str: string): string[] {
  return str
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-\s]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

/** `"blog post" -> "BlogPost"` */
export function pascalCase(str: string): string {
  return words(str).map(upperFirst).join('');
}

/** `"BlogPost" -> "blogPost"` */
export function camelCase(str: string): string {
  return lowerFirst(pascalCase(str));
}

/** `"BlogPost" -> "blog-post"` */
export function kebabCase(str: string): string {
  return words(str)
    .map((w) => w.toLowerCase())
    .join('-');
}

/** `"BlogPost" -> "blog_post"` */
export function snakeCase(str: string): string {
  return words(str)
    .map((w) => w.toLowerCase())
    .join('_');
}

const IRREGULAR_PLURALS: Record<string, string> = {
  person: 'people',
  man: 'men',
  woman: 'women',
  child: 'children',
  tooth: 'teeth',
  foot: 'feet',
  mouse: 'mice',
  goose: 'geese',
};

/** Naive English pluralization — good enough for resource/route naming. */
export function pluralize(word: string): string {
  const lower = word.toLowerCase();
  if (IRREGULAR_PLURALS[lower]) return matchCase(word, IRREGULAR_PLURALS[lower]);
  if (/(s|x|z|ch|sh)$/i.test(word)) return word + 'es';
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + 'ies';
  if (/(?:f|fe)$/i.test(word)) return word.replace(/fe?$/i, 'ves');
  return word + 's';
}

const IRREGULAR_SINGULARS: Record<string, string> = Object.fromEntries(
  Object.entries(IRREGULAR_PLURALS).map(([k, v]) => [v, k]),
);

/** Naive English singularization. */
export function singularize(word: string): string {
  const lower = word.toLowerCase();
  if (IRREGULAR_SINGULARS[lower]) return matchCase(word, IRREGULAR_SINGULARS[lower]);
  if (/ies$/i.test(word)) return word.slice(0, -3) + 'y';
  if (/ves$/i.test(word)) return word.slice(0, -3) + 'f';
  if (/(s|x|z|ch|sh)es$/i.test(word)) return word.slice(0, -2);
  if (/s$/i.test(word) && !/ss$/i.test(word)) return word.slice(0, -1);
  return word;
}

function matchCase(source: string, target: string): string {
  return source.charAt(0) === source.charAt(0).toUpperCase() ? upperFirst(target) : target;
}

/** Class name for a controller: `"users" -> "UsersController"` */
export function controllerClassName(name: string): string {
  return pascalCase(name) + 'Controller';
}

/** File name (no extension) for a controller: `"Users" -> "usersController"` */
export function controllerFileName(name: string): string {
  return camelCase(name) + 'Controller';
}

/** Class name for a model: singular Pascal. `"users" -> "User"` */
export function modelClassName(name: string): string {
  return pascalCase(singularize(name));
}

/** Class name for a socket: `"chat" -> "ChatSocket"` */
export function socketClassName(name: string): string {
  return pascalCase(name) + 'Socket';
}

/** File name (no extension) for a socket: `"Chat" -> "chatSocket"` */
export function socketFileName(name: string): string {
  return camelCase(name) + 'Socket';
}
