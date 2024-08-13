
import type { Root } from 'hast';
import { selectAll } from 'hast-util-select';
import type { InlineCode } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { addClassToProperties } from '../rehype-plugins/add-class';

export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'inlineCode', (node: InlineCode) => {
      const data = node.data || (node.data = {});
      // setting inline for rehypePlugin
      data.hProperties = { inline: true };
    });
  };
};

export const rehypePlugin: Plugin = () => {
  return (tree: Root) => {
    const codeElements = selectAll('code', tree);
    codeElements.forEach((element) => {
      // if inlineCode, properties.inline exists.
      if (element.properties?.inline != null) {
        element.properties.inline = true;
        addClassToProperties(element.properties, 'inline');
      }
    });
  };
};
