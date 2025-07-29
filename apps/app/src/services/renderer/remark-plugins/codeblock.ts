import type { Properties } from 'hast';
import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { InlineCode as MdastInlineCode, Html, Text } from 'mdast';
import type { Plugin } from 'unified';
import type { Node, Parent, Point } from 'unist';
import { visit } from 'unist-util-visit';


type InlineCode = MdastInlineCode & {
  data?: {
    hProperties?: Properties;
    [key: string]: unknown;
  };
};

const SUPPORTED_CODE = ['inline'];

export const remarkPlugin: Plugin = () => {

  return (tree: Node) => {
    const defaultPoint: Point = { line: 1, column: 1, offset: 0 };

    visit(tree, 'html', (node: Html, index: number | undefined, parent: Parent | undefined) => {
      // Find <code> tag
      if (typeof node.value === 'string' && node.value.toLowerCase() === '<code>') {
        if (parent && parent.children && index !== undefined) {
          const contentNode = parent.children[index + 1] as Text | undefined;
          const closingTagNode = parent.children[index + 2] as Html | undefined;

          // Find closing tag
          if (contentNode && contentNode.type === 'text'
            && closingTagNode && closingTagNode.type === 'html'
            && typeof closingTagNode.value === 'string' && closingTagNode.value.toLowerCase() === '</code>') {

            // Create InlineCode node
            const newInlineCodeNode: InlineCode = {
              type: 'inlineCode',
              value: contentNode.value,
              position: {
                start: contentNode.position?.start || node.position?.start || defaultPoint,
                end: contentNode.position?.end || closingTagNode.position?.end || defaultPoint,
              },
              data: {
                hProperties: { inline: 'true' },
              },
            };

            parent.children.splice(index, 3, newInlineCodeNode);
          }
        }
      }
    }, true);

    // Ensure all inlineCode nodes (including those from backticks) have the 'inline' property.
    visit(tree, 'inlineCode', (node: InlineCode) => {
      node.data = node.data || {};
      node.data.hProperties = (node.data.hProperties || {}) as Properties;
      node.data.hProperties.inline = 'true';
    });

    return tree;
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['code'],
  attributes: {
    code: SUPPORTED_CODE,
  },
};
