import * as urljoin from 'url-join';

import { envUtils } from 'growi-commons';

import { LinkHTMLAttributes, ScriptHTMLAttributes } from 'react';
import { cdnLocalScriptWebRoot, cdnLocalStyleWebRoot } from '^/config/cdn';
import * as cdnManifests from '^/resource/cdn-manifests';

import loggerFactory from '~/utils/logger';
import { CdnManifest, CdnManifestArgs } from '~/interfaces/cdn';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:CdnResourcesService');


const noCdn: boolean = envUtils.toBoolean(process.env.NO_CDN);

function getScriptManifestByName(name: string): CdnManifest | null {
  const manifests = cdnManifests.js
    .filter((manifest) => { return manifest.name === name });

  return (manifests.length > 0) ? manifests[0] : null;
}

function getStyleManifestByName(name: string): CdnManifest | null {
  const manifests = cdnManifests.style
    .filter((manifest) => { return manifest.name === name });

  return (manifests.length > 0) ? manifests[0] : null;
}

/**
 * Generate script tag string
 *
 * @param manifest
 */
function generateScriptTag(manifest: CdnManifest): JSX.Element {
  const args: CdnManifestArgs = manifest.args || {};

  const attrs: ScriptHTMLAttributes<HTMLScriptElement> = {};

  attrs.async = args.async;
  attrs.defer = args.defer;

  // TODO process integrity

  attrs.src = noCdn
    ? `${urljoin(cdnLocalScriptWebRoot, manifest.name)}.js`
    : manifest.url;

  return <script {...attrs}></script>;
}

/**
 * Generate style tag string
 *
 * @param {Object} manifest
 */
function generateStyleTag(manifest: CdnManifest): JSX.Element {
  // const args: CdnManifestArgs = manifest.args || {};

  const attrs: LinkHTMLAttributes<HTMLLinkElement> = {};

  attrs.rel = 'stylesheet';

  // TODO process integrity

  attrs.href = noCdn
    ? `${urljoin(cdnLocalStyleWebRoot, manifest.name)}.css`
    : manifest.url;

  return <link {...attrs}></link>;
}


export function getScriptTagByName(name: string): JSX.Element | null {
  const manifest = getScriptManifestByName(name);
  if (manifest == null) {
    return null;
  }
  return generateScriptTag(manifest);
}

export function getScriptTagsByGroup(group: string): JSX.Element[] {
  return cdnManifests.js
    .filter((manifest) => {
      return manifest.groups != null && manifest.groups.includes(group);
    })
    .map((manifest) => {
      return generateScriptTag(manifest);
    });
}

export function getStyleTagByName(name: string): JSX.Element | null {
  const manifest = getStyleManifestByName(name);
  if (manifest == null) {
    return null;
  }
  return generateStyleTag(manifest);
}

export function getStyleTagsByGroup(group: string): JSX.Element[] {
  return cdnManifests.style
    .filter((manifest) => {
      return manifest.groups != null && manifest.groups.includes(group);
    })
    .map((manifest) => {
      return generateStyleTag(manifest);
    });
}

// getHighlightJsStyleTag(styleName) {
//   let manifest = this.getStyleManifestByName('highlight-theme-github');

//   // replace style
//   if (!this.noCdn) {
//     const url = new URL(`${styleName}.css`, manifest.url); // resolve `${styleName}.css` from manifest.url

//     // clone manifest
//     manifest = Object.assign(manifest, { url: url.toString() });
//   }

//   return this.generateStyleTag(manifest);
// }
