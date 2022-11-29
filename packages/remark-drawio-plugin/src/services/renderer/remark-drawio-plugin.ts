import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
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
  };
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node, index) => {
      if (node.type === 'code') {
        if (isDrawioBlock(node.lang)) {
          rewriteNode(node, index ?? 0);

          // omit position to fix the key regardless of its position
          // see:
          //   https://github.com/remarkjs/react-markdown/issues/703
          //   https://github.com/remarkjs/react-markdown/issues/466
          //
          //   https://github.com/remarkjs/react-markdown/blob/a80dfdee2703d84ac2120d28b0e4998a5b417c85/lib/ast-to-react.js#L201-L204
          //   https://github.com/remarkjs/react-markdown/blob/a80dfdee2703d84ac2120d28b0e4998a5b417c85/lib/ast-to-react.js#L217-L222
          delete node.position;
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
