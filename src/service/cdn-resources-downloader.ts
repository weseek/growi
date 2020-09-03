import path from 'path';
import { URL } from 'url';
import urljoin from 'url-join';
import { Transform } from 'stream';
import replaceStream from 'replacestream';

import CdnResource from '~/models/cdn-resource';

import loggerFactory from '~/utils/logger';
import { downloadTo } from '~/utils/download';

const logger = loggerFactory('growi:service:CdnResourcesDownloader');

export default class CdnResourcesDownloader {

  /**
   * Download script files from CDN
   * @param {CdnResource[]} cdnResources JavaScript resource data
   * @param {any} options
   */
  async downloadScripts(cdnResources, options): Promise<any> {
    logger.debug('Downloading scripts', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'js';

    const promises = cdnResources.map((cdnResource) => {
      logger.info(`Processing CdnResource '${cdnResource.name}'`);

      return downloadTo(
        cdnResource.url,
        cdnResource.outDir,
        `${cdnResource.name}.${ext}`,
      );
    });

    return Promise.all(promises);
  }

  /**
   * Download style sheet file from CDN
   *  Assets in CSS is also downloaded
   * @param {CdnResource[]} cdnResources CSS resource data
   * @param {any} options
   */
  async downloadStyles(cdnResources, options): Promise<any> {
    logger.debug('Downloading styles', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'css';

    // styles
    const assetsResourcesStore: CdnResource[] = [];
    const promisesForStyle = cdnResources.map((cdnResource) => {
      logger.info(`Processing CdnResource '${cdnResource.name}'`);

      let urlReplacer: Transform|null = null;

      // generate replaceStream instance
      if (opts.replaceUrl != null) {
        urlReplacer = this.generateReplaceUrlInCssStream(cdnResource, assetsResourcesStore, opts.replaceUrl.webroot);
      }

      return downloadTo(
        cdnResource.url,
        cdnResource.outDir,
        `${cdnResource.name}.${ext}`,
        urlReplacer,
      );
    });

    // wait until all styles are downloaded
    await Promise.all(promisesForStyle);

    logger.debug('Downloading assets', assetsResourcesStore);

    // assets in css
    const promisesForAssets = assetsResourcesStore.map((cdnResource) => {
      logger.info(`Processing assts in css '${cdnResource.name}'`);

      return downloadTo(
        cdnResource.url,
        cdnResource.outDir,
        cdnResource.name,
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
   * @param {CdnResource[]} cdnResource CSS resource data
   * @param {CdnResource[]} assetsResourcesStore An array to store CdnResource that is detected by 'url()' in CSS
   * @param {string} webroot
   */
  generateReplaceUrlInCssStream(cdnResource, assetsResourcesStore, webroot): Transform {
    return replaceStream(
      /url\((?!['"]?data:)["']?(.+?)["']?\)/g, // https://regex101.com/r/Sds38A/3
      (match, url) => {
        // generate URL Object
        const parsedUrl = url.startsWith('http')
          ? new URL(url) // when url is fqcn
          : new URL(url, cdnResource.url); // when url is relative
        const basename = path.basename(parsedUrl.pathname);

        logger.debug(`${cdnResource.name} has ${parsedUrl.toString()}`);

        // add assets metadata to download later
        assetsResourcesStore.push(
          new CdnResource(
            basename,
            parsedUrl.toString(),
            path.join(cdnResource.outDir, cdnResource.name),
          ),
        );

        const replaceUrl = urljoin(webroot, cdnResource.name, basename);
        return `url(${replaceUrl})`;
      },
    );
  }

}
