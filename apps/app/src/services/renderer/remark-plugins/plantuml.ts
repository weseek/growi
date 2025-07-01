import plantuml from '@akebifiky/remark-simple-plantuml';
import type { Code } from 'mdast';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri: string,
  isDarkMode?: boolean,
}

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const { plantumlUri, isDarkMode } = options;

  const baseUrl = urljoin(plantumlUri, '/svg');
  const simplePlantumlPlugin = plantuml.bind(this)({ baseUrl });

  return (tree, file) => {
    visit(tree, 'code', (node: Code) => {
      if (node.lang === 'plantuml') {
        const themeLine = isDarkMode
          ? '!theme reddress-darkblue'
          : '!theme carbon-gray';

        // node.value = `${themeLine}\n${node.value}`;
        node.value = `${''}\n${node.value}`;
      }
    });

    simplePlantumlPlugin(tree, file);
  };
};
