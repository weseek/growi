import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Root } from 'mdast';
import { frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

const SUPPORTED_ATTRIBUTES = ['children', 'marp'];

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

  if (marp || slide) {

    const newNode: Node = {
      type: 'root',
      data: {},
      position: tree.position,
      children: tree.children,
    };

    const data = newNode.data ?? (newNode.data = {});
    tree.children = [newNode];
    data.hName = 'slide';
    data.hProperties = {
      marp: marp ? 'marp' : '',
      children: toMarkdown(tree as Root, {
        extensions: [
          frontmatterToMarkdown(['yaml']),
          gfmToMarkdown(),
          // TODO: add new extension remark-growi-directive to markdown
          // https://redmine.weseek.co.jp/issues/126744
        ],
      }),
    };
  }
};

export const remarkPlugin: Plugin = function() {
  return (tree) => {
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
