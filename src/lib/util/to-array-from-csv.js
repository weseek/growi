// converts csv item to array
const toArrayFromCsv = (text) => {
  let array = [];

  if (text == null) {
    return array;
  }

  array = text.split(',').map(el => el.trim());
  array = array.filter(el => el !== '');

  return array;
};

module.exports = toArrayFromCsv;
