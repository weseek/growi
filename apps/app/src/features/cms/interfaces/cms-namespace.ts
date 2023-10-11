export type ICmsNamespaceAttribute = Map<string, any>;
export type ICmsNamespace = {
  namespace: string,
  desc?: string,
  attributes?: ICmsNamespaceAttribute[],
  meta?: Map<string, any>,
};
