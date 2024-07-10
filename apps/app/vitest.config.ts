import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    environment: 'node',
    exclude: [
      '**/test/**', '**/*.spec.{tsx,jsx}',
    ],
    clearMocks: true,
    globals: true,
    coverage: {
      reportsDirectory: './coverage/unit',
    },
  },
});
