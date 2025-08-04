import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'happy-dom', // React testing environment
    clearMocks: true,
    globals: true,
    setupFiles: ['./test/setup.ts'],
  },
});
