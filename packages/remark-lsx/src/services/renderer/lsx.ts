import assert from 'assert';

import { pathUtils } from '@growi/core';
import { remarkGrowiDirectivePluginType } from '@growi/remark-growi-directive';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { selectAll, HastNode } from 'hast-util-select';
import isAbsolute from 'is-absolute-url';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/ls|lsx/);
const SUPPORTED_ATTRIBUTES = ['prefix', 'num', 'depth', 'sort', 'reverse', 'filter', 'except', 'isSharedPage'];

const { hasHeadingSlash } = pathUtils;

type DirectiveAttributes = Record<string, string>


export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node, index) => {
      if (node.type === remarkGrowiDirectivePluginType.Text || node.type === remarkGrowiDirectivePluginType.Leaf) {
        if (typeof node.name !== 'string') {
          return;
        }
        if (!NODE_NAME_PATTERN.test(node.name)) {
          return;
        }

        const data = node.data ?? (node.data = {});
        const attributes = node.attributes as DirectiveAttributes || {};

        // set 'prefix' attribute if the first attribute is only value
        // e.g.
        //   case 1: lsx(prefix=/path..., ...)    => prefix="/path"
        //   case 2: lsx(/path, ...)              => prefix="/path"
        //   case 3: lsx(/foo, prefix=/bar ...)   => prefix="/bar"
        if (attributes.prefix == null) {
          const attrEntries = Object.entries(attributes);

          if (attrEntries.length > 0) {
            const [firstAttrKey, firstAttrValue] = attrEntries[0];

            if (firstAttrValue === '' && !SUPPORTED_ATTRIBUTES.includes(firstAttrValue)) {
              attributes.prefix = firstAttrKey;
            }
          }
        }
        attributes.key = `lsx-${index}`;

        data.hName = 'lsx';
        data.hProperties = attributes;
      }
    });
  };
};

export type LsxRehypePluginParams = {
  pagePath?: string,
  isSharedPage?: boolean,
}

const pathResolver = (href: string, basePath: string): string => {
  // exclude absolute URL
  if (isAbsolute(href)) {
    // remove scheme
    return href.replace(/^(.+?):\/\//, '/');
  }

  // generate relative pathname
  const baseUrl = new URL(pathUtils.addTrailingSlash(basePath), 'https://example.com');
  const relativeUrl = new URL(href, baseUrl);

  return relativeUrl.pathname;
};

export const rehypePlugin: Plugin<[LsxRehypePluginParams]> = (options = {}) => {
  assert.notStrictEqual(options.pagePath, null, 'lsx rehype plugin requires \'pagePath\' option');

  return (tree) => {
    if (options.pagePath == null) {
      return;
    }

    const basePagePath = options.pagePath;
    const elements = selectAll('lsx', tree as HastNode);

    elements.forEach((lsxElem) => {
      if (lsxElem.properties == null) {
        return;
      }

      const isSharedPage = lsxElem.properties.isSharedPage;
      if (isSharedPage == null || typeof isSharedPage !== 'boolean') {
        lsxElem.properties.isSharedPage = options.isSharedPage;
      }

      const prefix = lsxElem.properties.prefix;

      // set basePagePath when prefix is undefined or invalid
      if (prefix == null || typeof prefix !== 'string') {
        lsxElem.properties.prefix = basePagePath;
        return;
      }

      // return when prefix is already determined and aboslute path
      if (hasHeadingSlash(prefix)) {
        return;
      }

      // resolve relative path
      lsxElem.properties.prefix = decodeURI(pathResolver(prefix, basePagePath));
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['lsx'],
  attributes: {
    lsx: SUPPORTED_ATTRIBUTES,
  },
};
