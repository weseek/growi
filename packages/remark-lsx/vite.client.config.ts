import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ outputDir: 'types' }),
  ],
  build: {
    outDir: 'dist/client',
    lib: {
      entry: {
        index: 'src/client/index.ts',
      },
      name: 'remark-lsx-libs',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'assert',
        'axios',
        'http-errors',
        'is-absolute-url',
        'react',
        'next/link',
        'unified',
        'swr',
        /^hast-.*/,
        /^unist-.*/,
        /^@growi\/.*/,
      ],
    },
  },
});
