
import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

function rewriteNode(node: Node) {
  // replace node
  const data = node.data ?? (node.data = {});
  data.hName = 'frontmatter';
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'yaml') {
        rewriteNode(node);
      }
    });
  };
};

export const rehypePlugin: Plugin = function() {
  return;
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['frontmatter'],
};
