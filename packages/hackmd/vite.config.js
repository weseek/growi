import { resolve } from 'path';

import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        styles: resolve(__dirname, 'src/hackmd-styles.js'),
        agent: resolve(__dirname, 'src/hackmd-agent.js'),
        stylesCSS: resolve(__dirname, 'src/styles.scss'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].css',
      },
    },
  },
});
