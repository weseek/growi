// converts csv item to array
const toArrayFromCsv = (text) => {
  const array = [];

  if (text == null) {
    return array;
  }

  text.split(',').forEach((element) => {
    array.push(element.trim());
  });

  return array;
};

module.exports = toArrayFromCsv;
