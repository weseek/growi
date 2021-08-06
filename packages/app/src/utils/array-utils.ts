// converts non-array item to array

export const toArrayIfNot = (item?: unknown): any[] => {
  if (item == null) {
    return [];
  }

  if (Array.isArray(item)) {
    return item;
  }

  return [item];
};
