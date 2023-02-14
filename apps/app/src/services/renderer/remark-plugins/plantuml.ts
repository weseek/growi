import plantuml from '@akebifiky/remark-simple-plantuml';
import { Plugin } from 'unified';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri?: string,
}

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const plantumlUri = options.plantumlUri ?? 'https://www.plantuml.com/plantuml';

  const baseUrl = urljoin(plantumlUri, '/svg');

  return plantuml.bind(this)({ baseUrl });
};
