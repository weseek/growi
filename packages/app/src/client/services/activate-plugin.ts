import { readFileSync } from 'fs';
import path from 'path';

import { GrowiPlugin } from '~/interfaces/plugin';
import { initializeGrowiFacade } from '~/utils/growi-facade';
import { resolveFromRoot } from '~/utils/project-dir-utils';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var pluginActivators: {
    [key: string]: {
      activate: () => void,
      deactivate: () => void,
    },
  };
}


export type GrowiPluginManifestEntries = [growiPlugin: GrowiPlugin, manifest: any][];


export class ActivatePluginService {

  static async retrievePluginManifests(growiPlugins: GrowiPlugin[]): Promise<GrowiPluginManifestEntries> {
    const entries: GrowiPluginManifestEntries = [];

    growiPlugins.forEach(async(growiPlugin) => {
      const manifestPath = resolveFromRoot(path.join('tmp/plugins', growiPlugin.installedPath, 'dist/manifest.json'));
      const customManifestStr: string = await readFileSync(manifestPath, 'utf-8');
      entries.push([growiPlugin, JSON.parse(customManifestStr)]);
    });

    return entries;
  }

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
