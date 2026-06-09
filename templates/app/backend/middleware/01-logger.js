// Request logger — the first middleware in the pipeline.
// Auto-loaded by server.js. Lower numeric prefixes run earlier.
export default async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${(ctx.type || 'GET').toUpperCase()} ${ctx.request.url} — ${ms}ms`);
};
