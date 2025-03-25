import type React from 'react';

import type { GrowiFacade } from '@growi/core';


declare global {
  interface Window {
    GrowiFacade: GrowiFacade
  }
}

/**
 * Retrieves the React instance that this package should use.
 *
 * - **Production Mode**: Returns the React instance from `window.GrowiFacade.react`
 *   to ensure consistency with GROWI's main React version.
 * - **Development Mode**: Returns the React instance passed as an argument,
 *   which typically allows local/hot reload development without conflicts.
 *
 * @param react - The React instance to use during development
 * @returns A React instance to be used in the current environment
 *
 * @remarks
 * This approach prevents bundling multiple React versions and avoids Hook conflicts.
 * Make sure the `window.GrowiFacade.react` object is set before calling this function
 * in a production environment.
 */
export const growiReact = (react: typeof React): typeof React => {
  if (process.env.NODE_ENV === 'production') {
    return window.GrowiFacade.react as typeof React;
  }
  return react as typeof React;
};
