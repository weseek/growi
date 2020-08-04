// converts csv item to array
const toArrayFromCsv = (text) => {
  const array = [];

  if (text == null) {
    return array;
  }

  text.split(',').forEach((element) => {
    const trimedElement = element.trim();
    if (trimedElement !== '') {
      array.push(trimedElement);
    }
  });

  return array;
};

module.exports = toArrayFromCsv;
