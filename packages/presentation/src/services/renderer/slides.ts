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

const nodeToMakrdown = (node: Node) => {
  return toMarkdown(node as Root, {
    extensions: [
      frontmatterToMarkdown(['yaml']),
      gfmToMarkdown(),
    ],
  });
};

// Allow node tree to be converted to markdown
const removeCustomType = (tree: Node) => {
  // Try toMarkdown() on all Node.
  visit(tree, (node) => {
    const tmp = node?.children;
    node.children = [];
    try {
      nodeToMakrdown(node);
    }
    catch (err) {
      // if some Node cannot convert to markdown, change to a convertible type
      node.type = 'text';
      node.value = '';
    }
    finally {
      node.children = tmp;
    }
  });
};

const rewriteNode = (tree: Node, node: Node, isEnabledMarp: boolean) => {

  const [marp, slide] = parseSlideFrontmatter(node.value as string);

  if ((marp && isEnabledMarp) || slide) {

    removeCustomType(tree);

    const markdown = nodeToMakrdown(tree);

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
      marp: (marp && isEnabledMarp) ? '' : undefined,
      children: markdown,
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
