import { RemarkGrowiPluginType } from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/ls|lsx/);


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

        data.hName = 'lsx';
        data.hProperties = attributes;
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['lsx'],
  attributes: {
    lsx: ['prefix', 'num', 'depth', 'sort', 'reverse', 'filter'],
  },
};
