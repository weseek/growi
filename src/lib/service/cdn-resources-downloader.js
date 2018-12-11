const axios = require('axios');
const path = require('path');
const { URL } = require('url');
const urljoin = require('url-join');
const fs = require('graceful-fs');
const replaceStream = require('replacestream');
const streamToPromise = require('stream-to-promise');


/**
 * Value Object
 */
class CdnResource {
  constructor(name, url, outDir) {
    this.name = name;
    this.url = url;
    this.outDir = outDir;
  }
}

class CdnResourcesDownloader {
  constructor() {
    this.logger = require('@alias/logger')('growi:service:CdnResourcesDownloader');
  }

  /**
   * Download script files from CDN
   * @param {CdnResource[]} cdnResources JavaScript resource data
   * @param {any} options
   */
  async downloadScripts(cdnResources, options) {
    this.logger.debug('Downloading scripts', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'js';

    const promises = cdnResources.map(cdnResource => {
      this.logger.info(`Processing CdnResource '${cdnResource.name}'`);

      return this.downloadAndWriteToFS(
        cdnResource.url,
        path.join(cdnResource.outDir, `${cdnResource.name}.${ext}`));
    });

    return Promise.all(promises);
  }

  /**
   * Download style sheet file from CDN
   *  Assets in CSS is also downloaded
   * @param {CdnResource[]} cdnResources CSS resource data
   * @param {any} options
   */
  async downloadStyles(cdnResources, options) {
    this.logger.debug('Downloading styles', cdnResources);

    const opts = Object.assign({}, options);
    const ext = opts.ext || 'css';

    // styles
    const assetsResourcesStore = [];
    const promisesForStyle = cdnResources.map(cdnResource => {
      this.logger.info(`Processing CdnResource '${cdnResource.name}'`);

      let urlReplacer = null;

      // generate replaceStream instance
      if (opts.replaceUrl != null) {
        urlReplacer = this.generateReplaceUrlInCssStream(cdnResource, assetsResourcesStore, opts.replaceUrl.webroot);
      }

      return this.downloadAndWriteToFS(
        cdnResource.url,
        path.join(cdnResource.outDir, `${cdnResource.name}.${ext}`),
        urlReplacer);
    });

    // wait until all styles are downloaded
    await Promise.all(promisesForStyle);

    this.logger.debug('Downloading assets', assetsResourcesStore);

    // assets in css
    const promisesForAssets = assetsResourcesStore.map(cdnResource => {
      this.logger.info(`Processing assts in css '${cdnResource.name}'`);

      // create dir if dir does not exist
      if (!fs.existsSync(cdnResource.outDir)) {
        fs.mkdirSync(cdnResource.outDir);
      }

      return this.downloadAndWriteToFS(
        cdnResource.url,
        path.join(cdnResource.outDir, cdnResource.name));
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
  generateReplaceUrlInCssStream(cdnResource, assetsResourcesStore, webroot) {
    return replaceStream(
      /url\((?!"data:)["']?(.+?)["']?\)/g,    // https://regex101.com/r/Sds38A/2
      (match, url) => {
        // generate URL Object
        const parsedUrl = url.startsWith('http')
          ? new URL(url)                    // when url is fqcn
          : new URL(url, cdnResource.url);  // when url is relative
        const basename = path.basename(parsedUrl.pathname);

        this.logger.debug(`${cdnResource.name} has ${parsedUrl.toString()}`);

        // add assets metadata to download later
        assetsResourcesStore.push(
          new CdnResource(
            basename,
            parsedUrl.toString(),
            path.join(cdnResource.outDir, cdnResource.name)
          )
        );

        const replaceUrl = urljoin(webroot, cdnResource.name, basename);
        return `url(${replaceUrl})`;
      });
  }

  async downloadAndWriteToFS(url, file, replacestream) {
    // get
    const response = await axios.get(url, { responseType: 'stream' });
    // replace and write
    let stream = response.data;
    if (replacestream != null) {
      stream = stream.pipe(replacestream);
    }
    stream = stream.pipe(fs.createWriteStream(file));

    return streamToPromise(stream);
  }

}

CdnResourcesDownloader.CdnResource = CdnResource;
module.exports = CdnResourcesDownloader;
