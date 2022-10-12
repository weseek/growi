import { resolve } from 'path';

import { defineConfig } from 'vite';


export default defineConfig({
  build: {
    manifest: true,
    rollupOptions: {
      input: {
        styles: resolve(__dirname, 'src/hackmd-styles.js'),
        agent: resolve(__dirname, 'src/hackmd-agent.js'),
      },
      output: {
        entryFileNames: 'assets/[name]_bundle.js',
      },
    },
  },
});
