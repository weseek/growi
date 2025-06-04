import { resolve } from 'path';

import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'cli.ts'),
      formats: ['es'],
      fileName: 'cli',
    },
    rollupOptions: {
      external: [
        /^node:/,
        'fs',
        'path',
        'util',
        'child_process',
        'process',
        'events',
      ],
      output: {
        banner: '#!/usr/bin/env node',
        entryFileNames: 'cli.mjs',
      },
    },
    outDir: __dirname,
    emptyOutDir: false,
    copyPublicDir: false,
  },
});
