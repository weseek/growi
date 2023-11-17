import { defineConfig, mergeConfig } from 'vitest/config';

import configShared from '../../vitest.config';

export default mergeConfig(
  configShared,
  defineConfig({
    test: {
      hookTimeout: 60000, // increased for downloading MongoDB binary file
      setupFiles: [
        './test-with-vite/setup/mongoms.ts',
      ],
    },
  }),
);
