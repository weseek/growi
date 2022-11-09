import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['drawioUri'];

type Lang = 'drawio';

function isDrawioBlock(lang: unknown): lang is Lang {
  return /^drawio$/.test(lang as string);
}

function rewriteNode(node: Node, lang: Lang) {
  const contents = node.value as string;

  // TODO: add node
  console.log('contents', contents);
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (isDrawioBlock(node.lang)) {
          rewriteNode(node, node.lang);
        }
      }
    });
  };
};

export type DrawioRehypePluginParams = {
  drawioUri: string,
}

export const rehypePlugin: Plugin<[DrawioRehypePluginParams]> = (options) => {
  // TODO: impl
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['drawio'],
  attributes: {
    lsx: SUPPORTED_ATTRIBUTES,
  },
};
