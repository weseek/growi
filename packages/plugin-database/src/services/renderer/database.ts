import assert from 'assert';

import { pathUtils } from '@growi/core';
import { RemarkGrowiPluginType } from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { selectAll, HastNode } from 'hast-util-select';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/database/);
const SUPPORTED_ATTRIBUTES = ['hoge'];

const { hasHeadingSlash } = pathUtils;

type DirectiveAttributes = Record<string, string>


export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === RemarkGrowiPluginType.Text || node.type === RemarkGrowiPluginType.Leaf) {
        if (typeof node.name !== 'string') {
          return;
        }
        if (!NODE_NAME_PATTERN.test(node.name)) {
          return;
        }

        const data = node.data ?? (node.data = {});
        const attributes = node.attributes as DirectiveAttributes || {};

        data.hName = 'database';
        data.hProperties = attributes;
      }
    });
  };
};

export type DatabaseRehypePluginParams = {
  pagePath?: string,
}

const pathResolver = (relativeHref: string, basePath: string): string => {
  // generate relative pathname
  const baseUrl = new URL(pathUtils.addTrailingSlash(basePath), 'https://example.com');
  const relativeUrl = new URL(relativeHref, baseUrl);

  return relativeUrl.pathname;
};

export const rehypePlugin: Plugin<[DatabaseRehypePluginParams]> = (options = {}) => {
  return (tree) => {
    if (options.pagePath == null) {
      return;
    }

    const basePagePath = options.pagePath;
    const elements = selectAll('database', tree as HastNode);

    elements.forEach((databaseElem) => {
      if (databaseElem.properties == null) {
        return;
      }

      const prefix = databaseElem.properties.prefix;

      // set basePagePath when prefix is undefined or invalid
      if (prefix == null || typeof prefix !== 'string') {
        databaseElem.properties.prefix = basePagePath;
        return;
      }

      // return when prefix is already determined and aboslute path
      if (hasHeadingSlash(prefix)) {
        return;
      }

      // resolve relative path
      databaseElem.properties.prefix = pathResolver(prefix, basePagePath);
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['database'],
  attributes: {
    database: SUPPORTED_ATTRIBUTES,
  },
};
