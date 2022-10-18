import assert from 'assert';

import { pathUtils } from '@growi/core';
import { RemarkGrowiPluginType } from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { selectAll, HastNode } from 'hast-util-select';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/database/);
const SUPPORTED_ATTRIBUTES = ['path', 'extract'];

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
  path?: string,
}

export const rehypePlugin: Plugin<[DatabaseRehypePluginParams]> = (options = {}) => {
  return (tree) => {
    // nothing to do (no need to register this rehypePlugin)
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['database'],
  attributes: {
    database: SUPPORTED_ATTRIBUTES,
  },
};
