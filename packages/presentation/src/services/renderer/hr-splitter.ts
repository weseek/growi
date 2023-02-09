import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Parent } from 'unist';
import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';


function wrapWithSection(parentNode: Parent, startIndex = 0, endIndex: number | undefined): void {
  const siblings = parentNode.children;

  const between = siblings.slice(
    startIndex,
    endIndex,
  );

  const section = {
    type: 'section',
    children: between,
    data: {
      hName: 'section',
    },
  };

  siblings.splice(startIndex, between.length, section);
}

export const remarkPlugin: Plugin = function() {

  let cursor = 0;
  return (tree) => {
    // wrap with <section>
    visit(
      tree,
      node => node.type === 'thematicBreak',
      (node, index, parent: Parent) => {
        if (index != null) {
          wrapWithSection(parent, cursor, index);

          // set cursor after index
          cursor = index + 1;
        }
      },
    );
  };
};


export const sanitizeOption: SanitizeOption = {
  // tagNames: ['slides', 'slide'],
};
