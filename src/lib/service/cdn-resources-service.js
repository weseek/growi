const { URL } = require('url');
const urljoin = require('url-join');

const helpers = require('@commons/util/helpers');

const cdnLocalScriptRoot = 'public/js/cdn';
const cdnLocalScriptWebRoot = '/js/cdn';
const cdnLocalStyleRoot = 'public/styles/cdn';
const cdnLocalStyleWebRoot = '/styles/cdn';


class CdnResourcesService {

  constructor() {
    this.logger = require('@alias/logger')('growi:service:CdnResourcesService');

    this.loadManifests();
  }

  loadManifests() {
    this.cdnManifests = require('@root/resource/cdn-manifests');
    this.logger.debug('manifest data loaded : ', this.cdnManifests);
  }

  noCdn() {
    return /^(true|1)$/i.test(process.env.NO_CDN);
  }

  getScriptManifestByName(name) {
    const manifests = this.cdnManifests.js
      .filter((manifest) => { return manifest.name === name });

    return (manifests.length > 0) ? manifests[0] : null;
  }

  getStyleManifestByName(name) {
    const manifests = this.cdnManifests.style
      .filter((manifest) => { return manifest.name === name });

    return (manifests.length > 0) ? manifests[0] : null;
  }

  /**
   * download all resources from CDN and write to FS
   *
   * !! This method should be invoked only by /bin/download-cdn-resources when build client !!
   *
   * @param {CdnResourceDownloader} cdnResourceDownloader
   */
  async downloadAndWriteAll(cdnResourceDownloader) {
    const CdnResource = require('@commons/models/cdn-resource');

    const cdnScriptResources = this.cdnManifests.js.map((manifest) => {
      const outDir = helpers.root(cdnLocalScriptRoot);
      return new CdnResource(manifest.name, manifest.url, outDir);
    });
    const cdnStyleResources = this.cdnManifests.style.map((manifest) => {
      const outDir = helpers.root(cdnLocalStyleRoot);
      return new CdnResource(manifest.name, manifest.url, outDir);
    });

    const dlStylesOptions = {
      replaceUrl: {
        webroot: cdnLocalStyleWebRoot,
      },
    };

    return Promise.all([
      cdnResourceDownloader.downloadScripts(cdnScriptResources),
      cdnResourceDownloader.downloadStyles(cdnStyleResources, dlStylesOptions),
    ]);
  }

  /**
   * Generate script tag string
   *
   * @param {Object} manifest
   */
  generateScriptTag(manifest) {
    const attrs = [];
    const args = manifest.args || {};

    if (args.async) {
      attrs.push('async');
    }
    if (args.defer) {
      attrs.push('defer');
    }

    // TODO process integrity

    const url = this.noCdn()
      ? `${urljoin(cdnLocalScriptWebRoot, manifest.name)}.js`
      : manifest.url;
    return `<script src="${url}" ${attrs.join(' ')}></script>`;
  }

  getScriptTagByName(name) {
    const manifest = this.getScriptManifestByName(name);
    return this.generateScriptTag(manifest);
  }

  getScriptTagsByGroup(group) {
    return this.cdnManifests.js
      .filter((manifest) => {
        return manifest.groups != null && manifest.groups.includes(group);
      })
      .map((manifest) => {
        return this.generateScriptTag(manifest);
      });
  }

  /**
   * Generate style tag string
   *
   * @param {Object} manifest
   */
  generateStyleTag(manifest) {
    const attrs = [];
    const args = manifest.args || {};

    if (args.async) {
      attrs.push('async');
    }
    if (args.defer) {
      attrs.push('defer');
    }

    // TODO process integrity

    const url = this.noCdn()
      ? `${urljoin(cdnLocalStyleWebRoot, manifest.name)}.css`
      : manifest.url;

    return `<link rel="stylesheet" href="${url}" ${attrs.join(' ')}>`;
  }

  getStyleTagByName(name) {
    const manifest = this.getStyleManifestByName(name);
    return this.generateStyleTag(manifest);
  }

  getStyleTagsByGroup(group) {
    return this.cdnManifests.style
      .filter((manifest) => {
        return manifest.groups != null && manifest.groups.includes(group);
      })
      .map((manifest) => {
        return this.generateStyleTag(manifest);
      });
  }

  getHighlightJsStyleTag(styleName) {
    let manifest = this.getStyleManifestByName('highlight-theme-github');

    // replace style
    if (!this.noCdn) {
      const url = new URL(`${styleName}.css`, manifest.url); // resolve `${styleName}.css` from manifest.url

      // clone manifest
      manifest = Object.assign(manifest, { url: url.toString() });
    }

    return this.generateStyleTag(manifest);
  }

}

module.exports = CdnResourcesService;
