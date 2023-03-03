import { isClient } from '@growi/core/dist/utils/browser-utils';

import { initializeGrowiFacade, registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

import { generateViewOptions, generatePreviewOptions } from './renderer/renderer';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var pluginActivators: {
    [key: string]: {
      activate: () => void,
      deactivate: () => void,
    },
  };
}

const logger = loggerFactory('growi:cli:ActivatePluginService');


export class ActivatePluginService {

  static activateAll(): void {
    initializeGrowiFacade();

    const { pluginActivators } = window;

    if (pluginActivators == null) {
      return;
    }

    Object.entries(pluginActivators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}

// register to facade
if (isClient()) {
  registerGrowiFacade({
    markdownRenderer: {
      optionsGenerators: {
        generateViewOptions,
        generatePreviewOptions,
      },
    },
  });
}
