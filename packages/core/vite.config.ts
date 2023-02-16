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
      entry: 'src/index.ts',
      name: 'core-libs',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: [
        'bson-objectid',
        'swr',
      ],
    },
  },
});
