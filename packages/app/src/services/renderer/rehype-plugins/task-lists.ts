import { selectAll, HastNode, Element } from 'hast-util-select';

import { RehypePlugin } from '~/interfaces/services/renderer';

export type ITaskListsRehypePluginOptions = {
  className: string,
};

const SELECTOR = 'table';

const generateWriter = (className: string) => (element: Element) => {
  const { properties } = element;

  if (properties == null) {
    return;
  }

  if (properties.className == null) {
    properties.className = className;
    return;
  }

  properties.className += ` ${className}`;
};

const adder = (className: string) => {
  const writer = generateWriter(className);
  return (node: HastNode) => selectAll(SELECTOR, node).forEach(writer);
};

export const taskLists: RehypePlugin = (option: ITaskListsRehypePluginOptions) => {
  const { className } = option;

  return adder(className);
};
