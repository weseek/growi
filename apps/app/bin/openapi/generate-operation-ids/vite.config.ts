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
        'fs',
        'path',
        '@apidevtools/swagger-parser',
        'commander',
      ],
      output: {
        banner: '#!/usr/bin/env node',
        entryFileNames: 'cli.mjs',
      },
    },
    outDir: __dirname,
    minify: false,
    emptyOutDir: false,
    copyPublicDir: false,
  },
});
