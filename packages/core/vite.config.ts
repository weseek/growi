import path from 'path';

import glob from 'glob';
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
      entry: glob.sync(path.resolve(__dirname, 'src/**/*.ts')),
      name: 'core-libs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: [
        'bson-objectid',
        'swr',
        /^node:.*/,
      ],
    },
  },
});
