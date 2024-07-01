import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    react(), tsconfigPaths(),
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    include: [
      '**/*.spec.{tsx,jsx}',
    ],
    coverage: {
      reportsDirectory: './coverage/components',
    },
  },
});
