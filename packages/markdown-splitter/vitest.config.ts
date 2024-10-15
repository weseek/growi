import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, coverageConfigDefaults } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: 'node',
    clearMocks: true,
    globals: true,
    coverage: {
      exclude: [
        ...coverageConfigDefaults.exclude,
        'src/**/index.ts',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        lines: 100,
        functions: 100,
      },
    },
  },
});
