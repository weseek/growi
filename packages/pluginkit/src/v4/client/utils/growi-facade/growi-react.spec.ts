import type React from 'react';

import { growiReact } from './growi-react';

describe('growiReact()', () => {
  const mockReact = { useState: () => {} } as unknown as typeof React;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    delete (global as any).window.GrowiFacade;
  });

  it('returns window.GrowiFacade.react in production mode', () => {
    // given
    process.env.NODE_ENV = 'production';
    const mockProductionReact = { useEffect: () => {} } as unknown as typeof React;

    (global as any).window = {
      GrowiFacade: {
        react: mockProductionReact,
      },
    };

    // when
    const result = growiReact(mockReact);

    // then
    expect(result).toBe(mockProductionReact);
  });

  it('returns the given react instance in development mode', () => {
    // given
    process.env.NODE_ENV = 'development';

    // when
    const result = growiReact(mockReact);

    // then
    expect(result).toBe(mockReact);
  });
});
