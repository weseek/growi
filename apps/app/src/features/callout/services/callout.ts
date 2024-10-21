import type { ContainerDirective } from 'mdast-util-directive';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

import { AllCallout } from './consts';

export const remarkPlugin: Plugin = () => {
  return (tree) => {
    visit(tree, 'containerDirective', (node: ContainerDirective) => {
      if (AllCallout.some(name => name === node.name.toLowerCase())) {
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
