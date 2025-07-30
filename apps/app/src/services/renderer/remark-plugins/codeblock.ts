import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { InlineCode } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';


export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'inlineCode', (node: InlineCode) => {
      // REMOVE THIS BLOCK
    });
  };
};

export const sanitizeOption: SanitizeOption = {
  tagNames: ['code'],
  attributes: {

    code: [
      'className', // Allow the 'class' attribute on <code> tags
      ['className', 'code-inline'], // Explicitly allow 'code-inline' as a class value
      // By NOT listing 'inline' here, rehype-sanitize will strip inline="true"
      // which is what you want for Markdown inline code.
    ],
    // If you have `data-line` attributes on code blocks, you might need to allow them globally or specifically:
    '*': ['data-line'],
  },
};
