import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production';

  return {
    publicDir: false,
    build: {
      manifest: true,
      rollupOptions: {
        input: [
          '/src/styles/theme/apply-colors.scss',
          '/src/styles/vendor.scss',
        ],
        output: {
          assetFileNames: isProd
            ? undefined
            : 'assets/[name].[ext]', // not attach hash
        },
      },
    },
  };
});
