import { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

export const remarkPlugin: Plugin = function() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'tableCell' || node.type === 'tableRow') {

        // omit position to fix the key regardless of its position
        // see:
        //   https://github.com/remarkjs/react-markdown/issues/703
        //   https://github.com/remarkjs/react-markdown/issues/466
        //
        //   https://github.com/remarkjs/react-markdown/blob/a80dfdee2703d84ac2120d28b0e4998a5b417c85/lib/ast-to-react.js#L201-L204
        //   https://github.com/remarkjs/react-markdown/blob/a80dfdee2703d84ac2120d28b0e4998a5b417c85/lib/ast-to-react.js#L217-L222
        delete node.position;
      }
    });
  };
};
