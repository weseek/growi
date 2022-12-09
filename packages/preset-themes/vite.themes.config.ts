import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: 'dist/themes',
    manifest: true,
    rollupOptions: {
      input: [
        '/src/styles/default.scss',
        '/src/styles/halloween.scss',
      ],
    },
  },
});
