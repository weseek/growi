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
    outDir: 'dist',
    lib: {
      entry: [
        'src/components/index.ts',
        'src/server/routes/index.ts',
        'src/services/renderer/index.ts',
      ],
      name: 'remark-lsx-libs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: [
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
