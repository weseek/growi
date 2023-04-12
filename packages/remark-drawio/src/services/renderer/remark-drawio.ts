import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['diagramIndex', 'bol', 'eol'];

type Lang = 'drawio';

function isDrawioBlock(lang: unknown): lang is Lang {
  return /^drawio$/.test(lang as string);
}

function rewriteNode(node: Node, index: number) {
  const data = node.data ?? (node.data = {});

  node.type = 'paragraph';
  node.children = [{ type: 'text', value: node.value }];
  data.hName = 'drawio';
  data.hProperties = {
    diagramIndex: index,
    bol: node.position?.start.line,
    eol: node.position?.end.line,
    key: `drawio-${index}`,
  };
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node, index) => {
      if (node.type === 'code') {
        if (isDrawioBlock(node.lang)) {
          rewriteNode(node, index ?? 0);
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
