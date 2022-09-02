import { Element } from 'hast-util-select';
import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

const REGEXP_TARGET_TAGNAMES = new RegExp(/h1|h2|h3|h4|h5|h6|p|img|pre|blockquote|hr|ol|ul/);

export const addLineNumberAttribute: Plugin = () => {
  return (tree) => {
    visit(tree, 'element', (node: Element) => {
      if (REGEXP_TARGET_TAGNAMES.test(node.tagName as string)) {
        if (node.properties != null) {
          node.properties['data-line'] = node.position?.start.line;
        }
      }
    });
  };
};
