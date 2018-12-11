const axios = require('axios');
const urljoin = require('url-join');
const fs = require('graceful-fs');

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

  async downloadAndWrite(url, file) {
    // get
    const response = await axios.get(url, { responseType: 'stream' });
    // write
    await response.data.pipe(fs.createWriteStream(file));
  }

  async downloadAndWriteAll() {
    const promisesForScript = this.cdnResources.js.map(resource => {
      return this.downloadAndWrite(resource.url, helpers.root(cdnLocalScriptRoot, `${resource.name}.js`));
    });
    const promisesForStyle = this.cdnResources.style.map(resource => {
      return this.downloadAndWrite(resource.url, helpers.root(cdnLocalStyleRoot, `${resource.name}.css`));
    });

    return Promise.all([promisesForScript, promisesForStyle]);
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

  getAllScriptTags() {
    return this.cdnResources.js.map(resource => {
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

    return `<link href="${url}" ${attrs.join(' ')}>`;
  }

  getAllStyleTags() {
    return this.cdnResources.style.map(resource => {
      return this.generateStyleTag(resource, this.noCdn);
    });
  }
}

module.exports = CdnResourcesService;
