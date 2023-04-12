import path from 'path';

import react from '@vitejs/plugin-react';
import glob from 'glob';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts(),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: glob.sync(path.resolve(__dirname, 'src/**/*.{ts,tsx}')),
      name: 'ui-libs',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: [
        'react', 'react-dom',
        'assert',
        'reactstrap',
        /^next\/.*/,
        /^@growi\/.*/,
      ],
    },
  },
});
