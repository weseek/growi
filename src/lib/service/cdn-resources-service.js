const axios = require('axios');
const path = require('path');
const { URL } = require('url');
const urljoin = require('url-join');
const fs = require('graceful-fs');
const replaceStream = require('replacestream');

const helpers = require('@commons/util/helpers');
const cdnLocalScriptRoot = 'public/js/cdn';
const cdnLocalScriptWebRoot = '/js/cdn';
const cdnLocalStyleRoot = 'public/styles/cdn';
const cdnLocalStyleWebRoot = '/styles/cdn';

class CdnResourcesService {
  constructor() {
    this.logger = require('@alias/logger')('growi:service:CdnResourcesResolver');

    this.noCdn = !!process.env.NO_CDN;
    this.loadMetaData();
  }

  loadMetaData() {
    this.cdnResources = require('@root/resource/cdn-resources');
    this.logger.debug('meta data loaded : ', this.cdnResources);
  }

  async downloadAndWrite(url, file, replacestream) {
    // get
    const response = await axios.get(url, { responseType: 'stream' });
    // replace and write
    let stream = response.data;
    if (replacestream != null) {
      stream = response.data.pipe(replacestream);
    }
    return stream.pipe(fs.createWriteStream(file));
  }

  async downloadAndWriteScripts() {
    const promisesForScript = this.cdnResources.js.map(resource => {
      return this.downloadAndWrite(
        resource.url,
        helpers.root(cdnLocalScriptRoot, `${resource.name}.js`));
    });

    return Promise.all(promisesForScript);
  }

  async downloadAndWriteStyles() {
    // styles
    const assets = [];
    const promisesForStyle = this.cdnResources.style.map(resource => {
      const urlReplacer = replaceStream(
        /url\((?!"data:)["']?(.+?)["']?\)/g,    // https://regex101.com/r/Sds38A/2
        (match, relativeUrl) => {
          // get basename
          const parsedUrl = new URL(relativeUrl, resource.url);
          const basename = path.basename(parsedUrl.pathname);

          // add assets metadata to download later
          assets.push({
            url: parsedUrl.toString(),
            dir: helpers.root(cdnLocalStyleRoot, resource.name),
            basename: basename,
          });

          const replaceUrl = urljoin(cdnLocalStyleWebRoot, resource.name, basename);
          return `url(${replaceUrl})`;
        });

      return this.downloadAndWrite(
        resource.url,
        helpers.root(cdnLocalStyleRoot, `${resource.name}.css`),
        urlReplacer);
    });

    await Promise.all(promisesForStyle);

    // assets in css
    const promisesForAssets = assets.map(resource => {
      // create dir if dir does not exist
      if (!fs.existsSync(resource.dir)) {
        fs.mkdirSync(resource.dir);
      }

      return this.downloadAndWrite(
        resource.url,
        path.join(resource.dir, resource.basename));
    });

    return Promise.all(promisesForAssets);
  }

  async downloadAndWriteAll() {
    return Promise.all([
      this.downloadAndWriteScripts(),
      this.downloadAndWriteStyles(),
    ]);
  }

  /**
   * Generate script tag string
   *
   * @param {Object} resource
   * @param {boolean} noCdn
   */
  generateScriptTag(resource, noCdn) {
    const attrs = [];
    const args = resource.args || {};

    if (args.async) {
      attrs.push('async');
    }
    if (args.defer) {
      attrs.push('defer');
    }

    // TODO process integrity

    const url = noCdn
      ? urljoin(cdnLocalScriptWebRoot, resource.name) + '.js'
      : resource.url;
    return `<script src="${url}" ${attrs.join(' ')}></script>`;
  }

  getScriptTagByName(name) {
    const tags = this.cdnResources.js
      .filter(resource => resource.name === name)
      .map(resource => {
        return this.generateScriptTag(resource, this.noCdn);
      });
    return tags[0];
  }

  getScriptTagsByGroup(group) {
    return this.cdnResources.js
      .filter(resource => {
        return resource.groups != null && resource.groups.includes(group);
      })
      .map(resource => {
        return this.generateScriptTag(resource, this.noCdn);
      });
  }

  /**
   * Generate style tag string
   *
   * @param {Object} resource
   * @param {boolean} noCdn
   */
  generateStyleTag(resource, noCdn) {
    const attrs = [];
    const args = resource.args || {};

    if (args.async) {
      attrs.push('async');
    }
    if (args.defer) {
      attrs.push('defer');
    }

    // TODO process integrity

    const url = noCdn
      ? urljoin(cdnLocalStyleWebRoot, resource.name) + '.css'
      : resource.url;

    return `<link rel="stylesheet" href="${url}" ${attrs.join(' ')}>`;
  }

  getStyleTagByName(name) {
    const tags = this.cdnResources.style
      .filter(resource => resource.name === name)
      .map(resource => {
        return this.generateStyleTag(resource, this.noCdn);
      });
    return tags[0];
  }

  getStyleTagsByGroup(group) {
    return this.cdnResources.style
      .filter(resource => {
        return resource.groups != null && resource.groups.includes(group);
      })
      .map(resource => {
        return this.generateStyleTag(resource, this.noCdn);
      });
  }
}

module.exports = CdnResourcesService;
