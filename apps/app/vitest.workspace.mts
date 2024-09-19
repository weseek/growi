import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import {
  defineConfig, defineWorkspace, mergeConfig,
} from 'vitest/config';

const configShared = defineConfig({
  plugins: [
    tsconfigPaths(),
  ],
  test: {
    clearMocks: true,
    globals: true,
  },
});

export default defineWorkspace([

  // unit test
  mergeConfig(
    configShared,
    {
      test: {
        name: 'app-unit',
        environment: 'node',
        include: ['**/*.spec.{ts,js}'],
        exclude: ['**/test/**'],
      },
    },
  ),

  // integration test
  mergeConfig(
    configShared,
    {
      test: {
        name: 'app-integration',
        environment: 'node',
        include: ['**/*.integ.ts'],
        exclude: ['**/test/**'],
        setupFiles: [
          './test-with-vite/setup/mongoms.ts',
        ],
      },
    },
  ),

  // component test
  mergeConfig(
    configShared,
    {
      plugins: [react()],
      test: {
        name: 'app-components',
        environment: 'happy-dom',
        include: [
          '**/*.spec.{tsx,jsx}',
        ],
        exclude: ['**/test/**'],
      },
    },
  ),
]);
