export const isDeepEquals = <T extends object>(obj1: T, obj2: T, isRecursively = true): boolean => {
  const typedKeys1 = Object.keys(obj1) as (keyof T)[];
  const typedKeys2 = Object.keys(obj2) as (keyof T)[];

  if (typedKeys1.length !== typedKeys2.length) {
    return false;
  }

  return typedKeys1.every((key) => {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if (!isRecursively) {
      return val1 === val2;
    }

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (val1 === null || val2 === null) {
        return val1 === val2;
      }

      // if array
      if (Array.isArray(val1) && Array.isArray(val2)) {
        return val1.length === val2.length && val1.every((item, i) => val2[i] === item);
      }

      // if object
      return isDeepEquals(val1, val2);
    }

    // if primitive
    return val1 === val2;
  });
};
