// converts non-array item to array

const toArrayIfNot = (item) => {
  if (item == null) {
    return [];
  }

  if (Array.isArray(item)) {
    return item;
  }

  return [item];
};

module.exports = toArrayIfNot;
