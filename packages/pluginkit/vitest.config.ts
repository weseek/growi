import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: 'node',
    clearMocks: true,
    globals: true,
    coverage: {
      thresholds: {
        statements: 42.78,
        branches: 63.15,
        lines: 42.78,
        functions: 26.31,
      },
    },
  },
});
