/**
 * Request Logger Middleware
 *
 * Logs all incoming requests with method, URL, and response time.
 *
 * Files are loaded alphabetically. Use 01-, 02-, 03- prefixes to control order.
 */

module.exports = async (ctx, next) => {
    const start = Date.now();
    const { type, request } = ctx;

    console.log(`→ ${type.toUpperCase()} ${request.url}`);

    await next(); // Continue to next middleware

    const duration = Date.now() - start;
    const statusCode = ctx.response.statusCode || 200;

    console.log(`← ${statusCode} ${type.toUpperCase()} ${request.url} (${duration}ms)`);
};
