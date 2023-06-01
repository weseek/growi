import plantuml from '@akebifiky/remark-simple-plantuml';
import { Plugin } from 'unified';
import { Node } from 'unist';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri: string;
};

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const plantumlUri = options.plantumlUri;
  const baseUrl = urljoin(plantumlUri, '/svg');

  return (tree: Node) => {
    const result = plantuml({ baseUrl })(tree);

    const children = result.children.map((child: Node) => {
      const modifiedTree = {
        type: 'paragraph',
        children: [child],
        properties: {
          'data-line': child.position?.start.line,
        },
      };
      return modifiedTree;
    });
    const wrappedTree = {
      type: 'root',
      children
    };

    return wrappedTree;
  };
};
