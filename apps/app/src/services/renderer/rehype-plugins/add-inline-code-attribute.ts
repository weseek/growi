// apps/app/src/services/renderer/rehype-plugins/add-inline-code-attribute.ts

import type { Element, Root } from 'hast';
import type { Plugin } from 'unified';
import type { Node, Parent } from 'unist'; // Import Node and Parent for 'parent' property
import { visit, type Test } from 'unist-util-visit';


// WORKAROUND: Define a local type that explicitly includes the 'parent' property.
// This is necessary because the 'parent' property is optional or not always
// directly typed on 'Node' in some versions of unist.
interface NodeWithParent extends Node {
  parent?: Parent | undefined;
}

/**
 * A Rehype plugin to ensure 'inline="true"' attribute is correctly applied to <code> tags.
 *
 * It aims to:
 * 1. Ensure <code> tags wrapped directly inside <pre> tags (block code) DO NOT have 'inline="true"'.
 * 2. Ensure <code> tags NOT wrapped directly inside <pre> tags (true inline code,
 * whether from Markdown backticks or raw HTML `<code>`) DO have 'inline="true"'.
 */
export const rehypePlugin: Plugin<[], Root> = () => {
  const isCodeElement: Test = { tagName: 'code', type: 'element' };

  return (tree) => {
    visit(tree, isCodeElement, (node: Element) => {
      const typedNode = node as NodeWithParent; // Cast to access 'parent' property

      // Determine if the <code> tag is directly inside a <pre> tag
      const isInsidePre = typedNode.parent
                          && typedNode.parent.type === 'element'
                          && (typedNode.parent as Element).tagName === 'pre';

      // --- Decision Logic ---
      if (isInsidePre) {
        // If it's inside a <pre> tag, it's a block code.
        // Ensure 'inline' property is removed if present.
        if (node.properties?.inline) {
          delete (node.properties as Record<string, any>).inline;
          // Clean up properties object if it becomes empty
          if (Object.keys(node.properties).length === 0) {
            node.properties = {};
          }
        }
      }
      else {
        // If it's NOT inside a <pre> tag, it should be treated as inline code.
        // Ensure 'inline="true"' is set.
        node.properties = node.properties || {};
        node.properties.inline = true;
      }
    });
  };
};
