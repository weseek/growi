const axios = require('axios');
const fs = require('graceful-fs');

const helpers = require('@commons/util/helpers');
const cdnLocalScriptRoot = 'public/js/cdn';
const cdnLocalStyleRoot = 'public/styles/cdn';

class CdnResourcesService {
  constructor() {
    this.logger = require('@alias/logger')('growi:service:CdnResourcesService');
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
}

module.exports = CdnResourcesService;
