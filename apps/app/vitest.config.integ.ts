import { defineConfig, mergeConfig } from 'vitest/config';

import configShared from './vitest.config';

export default mergeConfig(
  configShared,
  defineConfig({
    test: {
      include: [
        '**/*.integ.ts',
      ],
      setupFiles: [
        './test-with-vite/setup/mongoms.ts',
      ],
      coverage: {
        exclude: [
          '**/*{.,-}integ.ts',
        ],
      },
    },
  }),
);
