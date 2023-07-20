import react from '@vitejs/plugin-react';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      outputDir: 'dist',
      copyDtsFiles: true,
    }),
    {
      ...nodeExternals({ devDeps: true }),
      enforce: 'pre',
    },
  ],
  build: {
    outDir: 'dist/client',
    sourcemap: true,
    lib: {
      entry: {
        index: 'src/client/index.ts',
      },
      name: 'remark-lsx-libs',
      formats: ['es'],
    },
  },
});
