import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Parent, Node } from 'unist';
import { findAfter } from 'unist-util-find-after';
import { visit } from 'unist-util-visit';


function wrapWithSection(parentNode: Parent, startElem: Node, endElem: Node | null): void {
  const siblings = parentNode.children;

  const startIndex = siblings.indexOf(startElem);
  const endIndex = endElem != null ? siblings.indexOf(endElem) : undefined;

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

  return (tree) => {
    // wrap with <section>
    visit(
      tree,
      node => node.type !== 'thematicBreak',
      (node, index, parent: Parent) => {
        const startElem = node;
        const endElem = findAfter(parent, startElem, node => node.type === 'thematicBreak');

        wrapWithSection(parent, startElem, endElem);
      },
    );
  };
};


export const sanitizeOption: SanitizeOption = {
  // tagNames: ['slides', 'slide'],
};
