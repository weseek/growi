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
      lines: 100,
      functions: 100,
      branches: 100,
      statements: 100,
    },
  },
});
