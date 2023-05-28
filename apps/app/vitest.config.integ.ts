import { defineProject, mergeConfig } from 'vitest/config';

import configShared from './vitest.config';

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      include: [
        '**/*.integ.ts',
      ],
      setupFiles: [
        './test-with-vite/setup/mongoms.ts',
      ],
    },
  }),
);
