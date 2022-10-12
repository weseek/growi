import { resolve } from 'path';

import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        styles: resolve(__dirname, 'src/hackmd-styles.js'),
        agent: resolve(__dirname, 'src/hackmd-agent.js'),
        stylesCSS: resolve(__dirname, 'src/styles.scss'),
      },
      output: {
        entryFileNames: 'assets/[name]_bundle.js',
        assetFileNames: 'assets/[name]_bundle.css',
      },
    },
  },
});
