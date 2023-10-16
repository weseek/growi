import path from 'path';

import react from '@vitejs/plugin-react';
import glob from 'glob';
import { nodeExternals } from 'rollup-plugin-node-externals';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';


const excludeFiles = [
  '**/@types/*',
  '**/components/playground/*',
  '**/main.tsx',
  '**/vite-env.d.ts',
];

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      exclude: [
        ...excludeFiles,
      ],
      copyDtsFiles: true,
    }),
    {
      ...nodeExternals({
        devDeps: true,
        builtinsPrefix: 'ignore',
      }),
      enforce: 'pre',
    },
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    lib: {
      entry: glob.sync(path.resolve(__dirname, 'src/**/*.{ts,tsx}'), {
        ignore: [
          ...excludeFiles,
          '**/*.spec.ts',
        ],
      }),
      name: 'editor-libs',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      external: [
        'emoji-mart/css/emoji-mart.css',
      ],
    },
  },
});
