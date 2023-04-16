import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts(),
  ],
  build: {
    outDir: 'dist',
    lib: {
      entry: [
        'src/index.ts',
        'src/hackmd-styles.ts',
        'src/hackmd-agent.js',
        'src/style.scss',
      ],
      name: 'hackmd-libs',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'node:fs',
        'node:path',
      ],
    },
    sourcemap: true,
  },
});
