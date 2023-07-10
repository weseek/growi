import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Root } from 'mdast';
import { toMarkdown } from 'mdast-util-to-markdown';
import { handleClientScriptLoad } from 'next/script';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['hasMarpFlag', 'chidren'];

const rewriteNode = (tree: Node, node: Node) => {
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

  const data = tree.data ?? (tree.data = {});

  if (marp) {
    data.dName = 'slide';
    data.hProperties = {
      hasMarpFlag: true,
      children: toMarkdown(tree as Root, {
        handlers: {
          yaml: (node: string, parent: Node, state: State: info: Info ) => {

          }
        },
      }),
    };
  }
  else if (slide) {
    data.dName = 'slide';
    data.hProperties = {
      hasMarpFlag: false,
      children: toMarkdown(tree as Root),
    };
  }
};

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      console.log(tree);
      if (node.type === 'yaml' && node.value != null) {
        rewriteNode(tree, node);
      }
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['slide'],
  attributes: {
    slide: SUPPORTED_ATTRIBUTES,
  },
};
