import type { ContainerDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { githubCallout } from './consts';

export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (githubCallout[node.name] != null) {
        const data = node.data ?? (node.data = {});
        data.hName = 'callout';
        data.hProperties = {
          name: node.name,
        };
      }
    });
  };
};

export const sanitizeOption = {
  tagNames: ['callout'],
};
