import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({ outputDir: 'types' }),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: 'src/index.ts',
      name: 'slack-libs',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'assert',
        'axios',
        'crypto',
        'date-fns',
        'express',
        'extensible-custom-error',
        'http-errors',
        'bunyan', 'universal-bunyan',
        'url-join',
        /^@slack\/.*/,
      ],
    },
  },
});
