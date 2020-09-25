import path from 'path';

import { URL } from 'url';
import * as urljoin from 'url-join';

import { envUtils } from 'growi-commons';

import { cdnLocalScriptWebRoot, cdnLocalStyleWebRoot } from '^/config/cdn';
import * as cdnManifests from '^/resource/cdn-manifests';

import loggerFactory from '~/utils/logger';
import { CdnManifest, CdnManifestArgs } from '~/interfaces/cdn';

const logger = loggerFactory('growi:service:CdnResourcesService');


export default class CdnResourcesService {

  constructor() {
    this.loadManifests();
  }

  get noCdn() {
    return envUtils.toBoolean(process.env.NO_CDN);
  }

  loadManifests() {
    logger.debug('manifest data loaded : ', cdnManifests);
  }

  getScriptManifestByName(name: string): CdnManifest | null {
    const manifests = cdnManifests.js
      .filter((manifest) => { return manifest.name === name });

    return (manifests.length > 0) ? manifests[0] : null;
  }

  getStyleManifestByName(name: string): CdnManifest | null {
    const manifests = cdnManifests.style
      .filter((manifest) => { return manifest.name === name });

    return (manifests.length > 0) ? manifests[0] : null;
  }

  /**
   * Generate script tag string
   *
   * @param manifest
   */
  generateScriptTag(manifest: CdnManifest) {
    const attrs: string[] = [];
    const args: CdnManifestArgs = manifest.args || {};

    if (args.async) {
      attrs.push('async');
    }
    if (args.defer) {
      attrs.push('defer');
    }

    // TODO process integrity

    const url = this.noCdn
      ? `${urljoin(cdnLocalScriptWebRoot, manifest.name)}.js`
      : manifest.url;
    return `<script src="${url}" ${attrs.join(' ')}></script>`;
  }

  getScriptTagByName(name) {
    const manifest = this.getScriptManifestByName(name);
    return this.generateScriptTag(manifest);
  }

  getScriptTagsByGroup(group) {
    return cdnManifests.js
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

    const url = this.noCdn
      ? `${urljoin(cdnLocalStyleWebRoot, manifest.name)}.css`
      : manifest.url;

    return `<link rel="stylesheet" href="${url}" ${attrs.join(' ')}>`;
  }

  getStyleTagByName(name) {
    const manifest = this.getStyleManifestByName(name);
    return this.generateStyleTag(manifest);
  }

  getStyleTagsByGroup(group) {
    return cdnManifests.style
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
