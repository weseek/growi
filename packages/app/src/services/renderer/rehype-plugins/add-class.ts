// See: https://github.com/martypdx/rehype-add-classes for the original implementation.
// Re-implemeted in TypeScript.

import { selectAll, HastNode, Element } from 'hast-util-select';

import { RehypePlugin } from '~/interfaces/services/renderer';

export type SelectorName = string; // e.g. 'h1'
export type ClassName = string; // e.g. 'header'
export type Additions = Record<SelectorName, ClassName>;
export type AdditionsEntry = [SelectorName, ClassName];

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

const adder = (entry: AdditionsEntry) => {
  const [selectorName, className] = entry;
  const writer = generateWriter(className);

  return (node: HastNode) => selectAll(selectorName, node).forEach(writer);
};

export const addClass: RehypePlugin = (additions) => {
  const adders = Object.entries(additions).map(adder);

  return node => adders.forEach(a => a(node));
};
