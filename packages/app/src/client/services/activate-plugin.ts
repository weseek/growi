import { readFileSync } from 'fs';
import path from 'path';

import { CustomWindow } from '~/interfaces/global';
import { GrowiPlugin } from '~/interfaces/plugin';
import { resolveFromRoot } from '~/utils/project-dir-utils';


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
    const { pluginActivators } = window as CustomWindow;

    if (pluginActivators == null) {
      return;
    }

    Object.entries(pluginActivators).forEach(([, activator]) => {
      activator.activate();
    });
  }

}
