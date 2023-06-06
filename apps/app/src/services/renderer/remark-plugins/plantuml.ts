import plantuml from '@akebifiky/remark-simple-plantuml';
import { Plugin } from 'unified';
import { Parent, Node } from 'unist';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri: string,
};

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const plantumlUri = options.plantumlUri;
  const baseUri = urljoin(plantumlUri);

  return (tree: Parent) => {
    const modifiedChildren: Node[] = tree.children.map((child: Node) => {
      const { lang, value, position } = child;
      // Check if the node is a 'plantuml' code block and has a non-empty value
      if (lang === 'plantuml' && value !== '') {
        const line = position?.start?.line;
        const modifiedChild: Parent = {
          type: 'paragraph',
          children: [child],
          data: {
            // Add 'data-line' attribute to the paragraph's hProperties
            hProperties: line ? { 'data-line': line } : {},
          },
        };
        return modifiedChild; // Return the modified child node
      }
      return child; // Return the original child node
    });

    // Create the wrapped tree with modified children
    const wrappedTree: Parent = {
      type: 'root',
      children: modifiedChildren,
    };

    // Apply the plantuml plugin to the wrapped tree
    return plantuml({ baseUri })(wrappedTree);
  };
};
