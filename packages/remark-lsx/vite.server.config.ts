import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts(),
  ],
  build: {
    outDir: 'dist/server',
    sourcemap: true,
    lib: {
      entry: [
        'src/server/index.ts',
      ],
      name: 'remark-lsx-libs',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src/server',
      },
      external: [
        'axios',
        'escape-string-regexp',
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
