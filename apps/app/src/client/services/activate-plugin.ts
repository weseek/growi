import { initializeGrowiFacade, registerGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';

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

  static async activateAll(): Promise<void> {
    initializeGrowiFacade();

    // register renderer options to facade
    const { generateViewOptions, generatePreviewOptions } = await import('./renderer/renderer');
    registerGrowiFacade({
      markdownRenderer: {
        optionsGenerators: {
          generateViewOptions,
          generatePreviewOptions,
        },
      },
    });

    if (!('pluginActivators' in window)) {
      return;
    }

    Object.entries(pluginActivators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}
