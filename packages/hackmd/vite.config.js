import { resolve } from 'path';

import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    manifest: false,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.js'),
        styles: resolve(__dirname, 'src/styles.js'),
        agent: resolve(__dirname, 'src/agent.js'),
        stylesCSS: resolve(__dirname, 'src/styles.css'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].css',
      },
    },
  },
});
