/**
 * Next.js page generator.
 *
 * Emits an App Router page at `frontend/app/<kebab>/page.tsx`. Server Component by
 * default; pulls data from the MasterController backend via the `api()` helper.
 */
import { kebabCase, pascalCase } from '../lib/naming.js';
import type { GeneratorResult } from './types.js';

/** Build a Next.js App Router page for `name`. */
export function buildPage(name: string): GeneratorResult {
  const slug = kebabCase(name);
  const componentName = pascalCase(name) + 'Page';

  const contents = `// ${slug} page — Next.js App Router (Server Component).
// Fetch backend data with the api() helper from app/lib/api.ts.
import { api } from '../lib/api';

export default async function ${componentName}() {
  // const data = await api('/${slug}');
  return (
    <main style={{ padding: '2rem' }}>
      <h1>${pascalCase(name)}</h1>
      <p>Edit this page at <code>frontend/app/${slug}/page.tsx</code>.</p>
    </main>
  );
}
`;

  return {
    files: [{ path: `frontend/app/${slug}/page.tsx`, contents }],
    notes: [`Page created at /${slug} (frontend).`],
  };
}
