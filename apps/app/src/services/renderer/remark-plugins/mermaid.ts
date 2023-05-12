import { fromMarkdown } from 'mdast-util-from-markdown';
import { Plugin } from 'unified';
import { Node } from 'unist';
import { visit } from 'unist-util-visit';

function rewriteNode(node: Node) {
  const mermaidTree = fromMarkdown(node.value as string);

  // replace node
  if (mermaidTree.children[0] != null) {
    node.type = 'paragraph';
    node.children = mermaidTree.children[0].children;
  }
}

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'code' && node.lang === 'mermaid') {
        rewriteNode(node);
      }
    });
  };
};
