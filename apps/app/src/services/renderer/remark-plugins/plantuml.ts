import plantuml from '@akebifiky/remark-simple-plantuml';
import { Plugin } from 'unified';
import { Parent, Node } from 'unist';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri: string;
};

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const plantumlUri = options.plantumlUri;
  const baseUri = urljoin(plantumlUri);

  return (tree: Parent) => {
    const modifiedChildren: Node[] = [];

    tree.children.forEach((child: Node) => {
      console.log(child)
      if (child.lang === 'plantuml') {
        const modifiedChild: Parent = {
          type: 'paragraph',
          children: [child],
        };
        modifiedChildren.push(modifiedChild);
      } else {
        modifiedChildren.push(child);
      }
    });

    const wrappedTree: Parent = {
      type: 'root',
      children: modifiedChildren,
    };

    return plantuml({ baseUri })(wrappedTree);
  };
};
