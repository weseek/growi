import { pathUtils } from '@growi/core';
import { selectAll } from 'hast-util-select';
import { Plugin } from 'unified';

import {
  IAnchorsSelector, IHrefResolver, relativeLinks, RelativeLinksPluginParams,
} from './relative-links';

const customAnchorsSelector: IAnchorsSelector = (node) => {
  return selectAll('a[href].pukiwiki-like-linker', node);
};

const customHrefResolver: IHrefResolver = (relativeHref, basePath) => {
  // generate relative pathname
  const baseUrl = new URL(pathUtils.addTrailingSlash(basePath), 'https://example.com');
  const relativeUrl = new URL(relativeHref, baseUrl);

  return relativeUrl.pathname;
};

export const relativeLinksByPukiwikiLikeLinker: Plugin<[RelativeLinksPluginParams]> = (options = {}) => {
  return relativeLinks.bind(this)({
    ...options,
    anchorsSelector: customAnchorsSelector,
    hrefResolver: customHrefResolver,
  });
};
