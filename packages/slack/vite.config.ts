import path from 'path';

import glob from 'glob';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: glob.sync(path.resolve(__dirname, 'src/**/*.ts')),
      name: 'slack-libs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
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
        'qs',
        /^@slack\/.*/,
      ],
    },
  },
});
