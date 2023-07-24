import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ copyDtsFiles: true }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: {
        index: 'src/index.ts',
      },
      name: 'remark-drawio-libs',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react', 'react-dom',
        'pako',
        'throttle-debounce',
        'unified',
        'unist',
        /^hast-.*/,
        /^unist-.*/,
        /^@growi\/.*/,
      ],
    },
  },
});
