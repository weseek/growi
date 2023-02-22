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
      entry: [
        'src/hackmd-styles.js',
        'src/hackmd-agent.js',
        'src/style.scss',
      ],
      name: 'hackmd-libs',
      formats: ['es'],
    },
  },
});
