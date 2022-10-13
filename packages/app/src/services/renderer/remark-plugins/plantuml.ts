import plantuml from '@akebifiky/remark-simple-plantuml';
import { Plugin } from 'unified';

type PlantUMLPluginParams = {
  baseUrl?: string,
}

export const remarkPlugin: Plugin<[PlantUMLPluginParams]> = (options) => {
  const baseUrl = options.baseUrl ?? 'https://www.plantuml.com/plantuml/svg';

  return plantuml.bind(this)({ baseUrl });
};
