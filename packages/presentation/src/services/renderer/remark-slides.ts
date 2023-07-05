import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

function rewriteNode(node: Node) {

  let slide = false;
  let marp = false;

  const lines = (node.value as string).split('\n');

  lines.forEach((line) => {
    const [key, value] = line.split(':').map(part => part.trim());

    if (key === 'slide' && value === 'true') {
      slide = true;
    }
    else if (key === 'marp' && value === 'true') {
      marp = true;
    }
  });
  if (marp) {
    node.type = 'marp';
  }
  else if (slide) {
    node.type = 'slide';
  }
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'yaml' && node.value != null) {
        rewriteNode(node);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['slides'],
};
