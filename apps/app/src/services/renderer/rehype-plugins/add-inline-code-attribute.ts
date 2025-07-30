import type { Element } from 'hast';

export function rehypePlugin() {
  return (tree: any) => { // 'any' needs replacing probably
    function visitor(node: Element, parent: Element | null) {
      if (node.tagName === 'code') {
        const isInsidePre = parent
                            && parent.type === 'element'
                            && parent.tagName === 'pre';

        if (!isInsidePre) {
          node.properties = node.properties || {};

          if (!node.properties.className) {
            node.properties.className = [];
          }
          // This is the key part: push 'code-inline' to className
          if (Array.isArray(node.properties.className) && !node.properties.className.includes('code-inline')) {
            (node.properties.className as string[]).push('code-inline');
          }
        }
      }

      if ('children' in node && Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.type === 'element') {
            visitor(child as Element, node);
          }
        }
      }
    }

    if ('children' in tree && Array.isArray(tree.children)) {
      for (let i = 0; i < tree.children.length; i++) {
        const child = tree.children[i];
        if (child.type === 'element') {
          visitor(child as Element, tree as Element); // Pass tree as parent for its direct children
        }
      }
    }
  };
}
