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
      entry: 'src/index.ts',
      name: 'presentation-libs',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react', 'react-dom',
        'next/head',
        'react-markdown',
        '@marp-team/marp-core', '@marp-team/marpit',
        'reveal.js',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
