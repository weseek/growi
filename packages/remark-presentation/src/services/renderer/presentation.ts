import type { Schema as SanitizeOption } from 'hast-util-sanitize';
import type { Plugin } from 'unified';
import type { Parent, Node } from 'unist';
import { findAfter } from 'unist-util-find-after';
import { visit, EXIT } from 'unist-util-visit';


function wrapAllChildrenWithSlides(rootNode: Parent): void {
  const slides = {
    type: 'slides',
    children: rootNode.children,
    data: {
      hName: 'slides',
    },
  };

  rootNode.children = [slides];
}

function wrapWithSlide(parentNode: Parent, startElem: Node, endElem: Node | null): void {
  const siblings = parentNode.children;

  const startIndex = siblings.indexOf(startElem);
  const endIndex = endElem != null ? siblings.indexOf(endElem) : undefined;

  const between = siblings.slice(
    startIndex,
    endIndex,
  );

  const slide = {
    type: 'slide',
    children: between,
    data: {
      hName: 'slide',
    },
  };

  siblings.splice(startIndex, between.length, slide);
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    // wrap with <slides>
    visit(tree, (node) => {
      if (node.type === 'root') {
        const rootNode = node as Parent;
        wrapAllChildrenWithSlides(rootNode);

        return [EXIT];
      }
    });

    // wrap with <slide>
    visit(
      tree,
      node => node.type === 'heading',
      (node, index, parent: Parent) => {
        const startElem = node;
        const endElem = findAfter(parent, startElem, node => node.type === 'heading');

        wrapWithSlide(parent, startElem, endElem);
      },
    );
  };
};


export const sanitizeOption: SanitizeOption = {
  tagNames: ['slides', 'slide'],
};
