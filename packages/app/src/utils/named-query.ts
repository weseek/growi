export const nqStringRegExp = new RegExp(/^\[nq:.+\]$/g); // https://regex101.com/r/FzDUvT/1
export const nqReplaceRegExp = new RegExp(/\[nq:|\]/g);

export const isNQ = (queryString: string): boolean => {
  return nqStringRegExp.test(queryString);
};

export const parseNQString = (queryString: string): string => {
  if (!isNQ(queryString)) throw Error('This queryString does not have the named query format.');

  return queryString.replace(nqReplaceRegExp, '');
};
