import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts(),
  ],
  build: {
    outDir: 'dist/server',
    sourcemap: true,
    lib: {
      entry: [
        'src/server/index.ts',
      ],
      name: 'remark-attachment-refs-libs',
      formats: ['cjs'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src/server',
      },
      external: [
        'bunyan',
        'http-errors',
        'universal-bunyan',
        'react',
        'react-dom',
        /^@growi\/.*/,
      ],
    },
  },
});
