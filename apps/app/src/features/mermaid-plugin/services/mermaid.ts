import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

function rewriteNode(node: Node) {
  // replace node
  const data = node.data ?? (node.data = {});
  data.hName = 'mermaid';
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code' && node.lang === 'mermaid') {
        rewriteNode(node);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['mermaid'],
};
