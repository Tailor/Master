// Integration test through the real pipeline (ASP.NET WebApplicationFactory-style).
// Run with `master test` (or `npm test` inside backend/).
import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import master from 'mastercontroller';

let client;
after(() => client && client.close());

test('GET /health answers ok:true and liveness is up', async () => {
  process.env.MC_DISABLE_DEFAULT_LOG_PROVIDER = '1';
  client = await master.createTestClient({
    root: dirname(dirname(fileURLToPath(import.meta.url))),
    app: 'app',
    environment: 'test',
    configure: (m) => { m.useHealthChecks({ path: '/health/report' }); },
  });
  const res = await client.get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.json().ok, true);
  const live = await client.get('/health/live');
  assert.equal(live.status, 200);
  assert.equal(live.json().status, 'Healthy');
});
