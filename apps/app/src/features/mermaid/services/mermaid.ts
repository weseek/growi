import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Code } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

function rewriteNode(node: Code) {
  // replace node
  const data = node.data ?? (node.data = {});
  data.hName = 'mermaid';
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code' && (node as Code).lang === 'mermaid') {
        rewriteNode(node as Code);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['mermaid'],
};
