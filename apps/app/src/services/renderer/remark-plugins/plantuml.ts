import plantuml from '@akebifiky/remark-simple-plantuml';
import type { Plugin } from 'unified';
import urljoin from 'url-join';

type PlantUMLPluginParams = {
  plantumlUri: string;
};

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const plantumlUri = options.plantumlUri;

  const baseUrl = urljoin(plantumlUri, '/svg');

  return plantuml.bind(this)({ baseUrl });
};
