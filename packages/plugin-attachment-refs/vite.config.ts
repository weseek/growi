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
      entry: glob.sync(path.resolve(__dirname, 'src/**/*.{js,jsx}')),
      name: 'plugin-attachment-refs-libs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: [
        'bunyan',
        'http-errors',
        'universal-bunyan',
        'react',
        'react-dom',
      ],
    },
  },
});
