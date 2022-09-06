import { Element } from 'hast-util-select';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const REGEXP_TARGET_TAGNAMES = new RegExp(/h1|h2|h3|h4|h5|h6|p|img|pre|blockquote|hr|ol|ul/);

export const addLineNumberAttribute: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (REGEXP_TARGET_TAGNAMES.test(node.tagName as string)) {
        const properties = node.properties ?? {};

        // add class
        properties.className = [properties.className?.toString() ?? '', 'has-data-line'];
        // add attribute
        properties['data-line'] = node.position?.start.line;

        node.properties = properties;
      }
    });
  };
};
