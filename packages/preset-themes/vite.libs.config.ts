import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist/libs',
    copyPublicDir: false,
    lib: {
      entry: 'src/index.ts',
      name: 'preset-themes-libs',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
