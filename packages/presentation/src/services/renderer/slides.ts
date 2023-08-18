import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Root } from 'mdast';
import { frontmatterToMarkdown } from 'mdast-util-frontmatter';
import { gfmToMarkdown } from 'mdast-util-gfm';
import { toMarkdown } from 'mdast-util-to-markdown';
import type { Plugin } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

import { parseSlideFrontmatter } from '../parse-slide-frontmatter';

const SUPPORTED_ATTRIBUTES = ['children', 'marp'];

const rewriteNode = (tree: Node, node: Node, isEnabledMarp: boolean) => {

  const [marp, slide] = parseSlideFrontmatter(node.value as string);

  if ((marp && isEnabledMarp) || slide) {

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

type SlidePluginParams = {
  isEnabledMarp: boolean,
}

export const remarkPlugin: Plugin<[SlidePluginParams]> = (options) => {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'yaml' && node.value != null) {
        rewriteNode(tree, node, options.isEnabledMarp);
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
