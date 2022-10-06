// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const isAbleToSaveDatabasePage = (body: string) => {
  // https://regex101.com/r/vzGbM8/1
  const result = body.match(/^\|.*?\|$\n^(\|\s*-+\s*)+\|$/gm);
  return result != null && result.length === 1;
};
