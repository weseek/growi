
import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { InlineCode } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const rewriteNode = (node: InlineCode) => {
  const data = node.data ?? (node.data = {});
  data.hName = 'inlinecode';
};


export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'inlineCode') {
        rewriteNode(node as InlineCode);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['inlinecode'],
};
