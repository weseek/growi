import assert from 'assert';

import { pathUtils } from '@growi/core';
import { RemarkGrowiPluginType } from '@growi/remark-growi-plugin';
import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { selectAll, HastNode } from 'hast-util-select';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const NODE_NAME_PATTERN = new RegExp(/database/);
const SUPPORTED_ATTRIBUTES = ['databasePath'];

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
  databasePath?: string,
}

export const rehypePlugin: Plugin<[DatabaseRehypePluginParams]> = (options = {}) => {
  return (tree) => {
    return tree;
    // console.log('tree');
    // console.log(JSON.stringify(tree));
    // // assert.notStrictEqual(options.databasePath, null, 'database rehype plugin requires \'databasePath\' option');
    // console.log('rehypePlugin options');
    // console.log(options);
    // if (options.databasePath == null) {
    //   return;
    // }

    // const elements = selectAll('database', tree as HastNode);

    // elements.forEach((databaseElem) => {
    //   if (databaseElem.properties == null) {
    //     return;
    //   }
    //   databaseElem.properties.databasePath = options.databasePath;

    //   console.log('databaseElem.databasePath');
    //   console.log(databaseElem.databasePath);
    // });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['database'],
  attributes: {
    database: SUPPORTED_ATTRIBUTES,
  },
};
