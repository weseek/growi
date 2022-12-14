import { readFileSync } from 'fs';
import path from 'path';

import { GrowiThemeMetadata, ViteManifest } from '@growi/core';

import { GrowiPlugin, GrowiPluginResourceType, GrowiThemePluginMeta } from '~/interfaces/plugin';
import { initializeGrowiFacade } from '~/utils/growi-facade';
import loggerFactory from '~/utils/logger';
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

const logger = loggerFactory('growi:cli:ActivatePluginService');

export type GrowiPluginManifestEntries = [growiPlugin: GrowiPlugin, manifest: ViteManifest][];


async function retrievePluginManifest(growiPlugin: GrowiPlugin): Promise<ViteManifest> {
  const manifestPath = resolveFromRoot(path.join('tmp/plugins', growiPlugin.installedPath, 'dist/manifest.json'));
  const manifestStr: string = await readFileSync(manifestPath, 'utf-8');
  return JSON.parse(manifestStr);
}

export class ActivatePluginService {

  static async retrieveThemeHref(growiPlugins: GrowiPlugin[], theme: string): Promise<string | undefined> {

    let matchedPlugin: GrowiPlugin | undefined;
    let matchedThemeMetadata: GrowiThemeMetadata | undefined;

    growiPlugins
      .filter(p => p.meta.types.includes(GrowiPluginResourceType.Theme))
      .forEach(async(growiPlugin) => {
        const themeMetadatas = (growiPlugin.meta as GrowiThemePluginMeta).themes;
        const themeMetadata = themeMetadatas.find(t => t.name === theme);

        // found
        if (themeMetadata != null) {
          matchedPlugin = growiPlugin;
          matchedThemeMetadata = themeMetadata;
        }
      });

    if (matchedPlugin != null && matchedThemeMetadata != null) {
      const manifest = await retrievePluginManifest(matchedPlugin);
      return '/static/plugins' // configured by express.static
        + `/${matchedPlugin.installedPath}/dist/${manifest[matchedThemeMetadata.manifestKey].file}`;
    }
  }

  static async retrievePluginManifestEntries(growiPlugins: GrowiPlugin[]): Promise<GrowiPluginManifestEntries> {
    const entries: GrowiPluginManifestEntries = [];

    growiPlugins.forEach(async(growiPlugin) => {
      try {
        const manifest = await retrievePluginManifest(growiPlugin);
        entries.push([growiPlugin, manifest]);
      }
      catch (e) {
        logger.warn(e);
      }
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
