import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
    environment: 'node',
    // Integration tests spawn real fs work into temp dirs; give them room.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
