import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    clearMocks: true,
    globals: true,
    hookTimeout: 60000, // increased for downloading MongoDB binary file
    setupFiles: ['./test-with-vite/setup/mongoms.ts'],
  },
});
