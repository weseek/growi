export const isIncludeAiMenthion = (keyword: string): boolean => {
  return keyword.match(/(^|\s)@ai(\s|$)/) != null;
};

export const removeAiMenthion = (keyword: string): string => {
  return keyword.replaceAll(/(^|\s)@ai(\s|$)/g, '');
};
