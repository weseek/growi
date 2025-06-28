export type Delta = Array<{
  // biome-ignore lint/suspicious/noExplicitAny: ignore
  insert?: string | object | Array<any>;
  delete?: number;
  retain?: number;
}>;
