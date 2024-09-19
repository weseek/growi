import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineProject, defineWorkspace, mergeConfig } from 'vitest/config';

const projectShared = defineProject({
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
    projectShared,
    {
      test: {
        name: 'app-unit',
        environment: 'node',
        include: ['**/*.spec.{ts,js}'],
        exclude: ['**/test/**'],
        coverage: {
          reportsDirectory: './coverage/unit',
        },
      },
    },
  ),

  // integration test
  mergeConfig(
    projectShared,
    {
      test: {
        name: 'app-integration',
        environment: 'node',
        include: ['**/*.integ.ts'],
        exclude: ['**/test/**'],
        setupFiles: [
          './test-with-vite/setup/mongoms.ts',
        ],
        coverage: {
          reportsDirectory: './coverage/integ',
          exclude: [
            '**/*{.,-}integ.ts',
          ],
        },
      },
    },
  ),

  // component test
  mergeConfig(
    projectShared,
    {
      plugins: [react()],
      test: {
        name: 'app-components',
        environment: 'happy-dom',
        include: [
          '**/*.spec.{tsx,jsx}',
        ],
        exclude: ['**/test/**'],
        coverage: {
          reportsDirectory: './coverage/components',
        },
      },
    },
  ),
]);
