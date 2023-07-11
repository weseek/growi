import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Root } from 'mdast';
import { frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
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
    // data.hName = 'slide';
    data.hProperties = {
      hasMarpFlag: true,
      children: toMarkdown(tree as Root, {
        extensions: [
          frontmatterToMarkdown(['yaml']),
          gfmToMarkdown(),
          // TODO: add new extension remark-growi-directive to markdown
        ],
      }),
    };
  }
  else if (slide) {
    // data.hName = 'slide';
    data.hProperties = {
      hasMarpFlag: false,
      children: toMarkdown(tree as Root, {
        extensions: [
          frontmatterToMarkdown(['yaml']),
          gfmToMarkdown(),
        ],
      }),
    };
  }
};

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    console.log(tree);
    visit(tree, (node) => {
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
