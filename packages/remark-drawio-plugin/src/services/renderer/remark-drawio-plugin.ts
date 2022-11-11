import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['drawioEmbedUri'];

type Lang = 'drawio';

function isDrawioBlock(lang: unknown): lang is Lang {
  return /^drawio$/.test(lang as string);
}

export type DrawioRemarkPluginParams = {
  drawioEmbedUri?: string,
}

function rewriteNode(node: Node, options: DrawioRemarkPluginParams) {
  const data = node.data ?? (node.data = {});

  node.type = 'paragraph';
  node.children = [{ type: 'text', value: node.value }];
  data.hName = 'drawio';
  data.hProperties = { drawioEmbedUri: options.drawioEmbedUri };
}

export const remarkPlugin: Plugin<[DrawioRemarkPluginParams]> = function(options = {}) {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code') {
        if (isDrawioBlock(node.lang)) {
          rewriteNode(node, options);
        }
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['drawio'],
  attributes: {
    drawio: SUPPORTED_ATTRIBUTES,
  },
};
