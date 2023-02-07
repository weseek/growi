import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Parent } from 'unist';
import { findAfter } from 'unist-util-find-after';
import { visitParents } from 'unist-util-visit-parents';


export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visitParents(
      tree,
      node => node.type === 'heading',
      (node, ancestors) => {
        const parent = ancestors.slice(-1)[0] as Parent;

        const startElem = node;
        const endElem = findAfter(parent, startElem, node => node.type === 'heading');

        const startIndex = parent.children.indexOf(startElem);
        const endIndex = endElem != null ? parent.children.indexOf(endElem) : undefined;

        const between = parent.children.slice(
          startIndex,
          endIndex,
        );

        const section = {
          type: 'slide',
          children: between,
          data: {
            hName: 'slide',
          },
        };

        parent.children.splice(startIndex, section.children.length, section);
      },
    );
  };
};


export const sanitizeOption: SanitizeOption = {
  tagNames: ['slide'],
};
