import path from 'path';
import { URL } from 'url';
import urljoin from 'url-join';
import { Transform } from 'stream';
import replaceStream from 'replacestream';

import { cdnLocalScriptRoot, cdnLocalStyleRoot, cdnLocalStyleWebRoot } from '^/config/cdn';
import * as cdnManifests from '^/resource/cdn-manifests';

import { CdnResource, CdnManifest } from '~/interfaces/cdn';
import loggerFactory from '~/utils/logger';
import { downloadTo } from '~/utils/download';

const logger = loggerFactory('growi:service:CdnResourcesDownloader');

export default class CdnResourcesDownloader {

  async downloadAndWriteAll(): Promise<any> {
    const cdnScriptResources: CdnResource[] = cdnManifests.js.map((manifest: CdnManifest) => {
      return { manifest, outDir: cdnLocalScriptRoot };
    });

    const cdnStyleResources: CdnResource[] = cdnManifests.style.map((manifest) => {
      return { manifest, outDir: cdnLocalStyleRoot };
    });

    const dlStylesOptions = {
      replaceUrl: {
        webroot: cdnLocalStyleWebRoot,
      },
    };

    return Promise.all([
      this.downloadScripts(cdnScriptResources),
      this.downloadStyles(cdnStyleResources, dlStylesOptions),
    ]);
  }

  /**
   * Download script files from CDN
   * @param cdnResources JavaScript resource data
   * @param options
   */
  private async downloadScripts(cdnResources: CdnResource[], options?: any): Promise<any> {
    logger.debug('Downloading scripts', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'js';

    const promises = cdnResources.map((cdnResource) => {
      const { manifest } = cdnResource;

      logger.info(`Processing CdnResource '${manifest.name}'`);

      return downloadTo(
        manifest.url,
        cdnResource.outDir,
        `${manifest.name}.${ext}`,
      );
    });

    return Promise.all(promises);
  }

  /**
   * Download style sheet file from CDN
   *  Assets in CSS is also downloaded
   * @param cdnResources CSS resource data
   * @param options
   */
  private async downloadStyles(cdnResources: CdnResource[], options?: any): Promise<any> {
    logger.debug('Downloading styles', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'css';

    // styles
    const assetsResourcesStore: CdnResource[] = [];
    const promisesForStyle = cdnResources.map((cdnResource) => {
      const { manifest } = cdnResource;

      logger.info(`Processing CdnResource '${manifest.name}'`);

      let urlReplacer: Transform|null = null;

      // generate replaceStream instance
      if (opts.replaceUrl != null) {
        urlReplacer = this.generateReplaceUrlInCssStream(cdnResource, assetsResourcesStore, opts.replaceUrl.webroot);
      }

      return downloadTo(
        manifest.url,
        cdnResource.outDir,
        `${manifest.name}.${ext}`,
        urlReplacer,
      );
    });

    // wait until all styles are downloaded
    await Promise.all(promisesForStyle);

    logger.debug('Downloading assets', assetsResourcesStore);

    // assets in css
    const promisesForAssets = assetsResourcesStore.map((cdnResource) => {
      const { manifest } = cdnResource;

      logger.info(`Processing assts in css '${manifest.name}'`);

      return downloadTo(
        manifest.url,
        cdnResource.outDir,
        manifest.name,
      );
    });

    return Promise.all(promisesForAssets);
  }

  /**
   * Generate replaceStream instance to replace 'url(..)'
   *
   * e.g.
   *  Before  : url(../images/logo.svg)
   *  After   : url(/path/to/webroot/${cdnResources.name}/logo.svg)
   *
   * @param cdnResource CSS resource data
   * @param assetsResourcesStore An array to store CdnResource that is detected by 'url()' in CSS
   * @param webroot
   */
  private generateReplaceUrlInCssStream(cdnResource: CdnResource, assetsResourcesStore: CdnResource[], webroot: string): Transform {
    return replaceStream(
      /url\((?!['"]?data:)["']?(.+?)["']?\)/g, // https://regex101.com/r/Sds38A/3
      (match, url) => {
        // generate URL Object
        const parsedUrl = url.startsWith('http')
          ? new URL(url) // when url is fqcn
          : new URL(url, cdnResource.manifest.url); // when url is relative
        const basename = path.basename(parsedUrl.pathname);

        logger.debug(`${cdnResource.manifest.name} has ${parsedUrl.toString()}`);

        // add assets metadata to download later
        const replacedCdnResource = {
          manifest: {
            name: basename,
            url: parsedUrl.toString(),
          },
          outDir: path.join(cdnResource.outDir, cdnResource.manifest.name),
        };
        assetsResourcesStore.push(replacedCdnResource);

        const replaceUrl = urljoin(webroot, cdnResource.manifest.name, basename);
        return `url(${replaceUrl})`;
      },
    );
  }

}
