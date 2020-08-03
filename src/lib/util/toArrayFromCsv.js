
// converts csv item to array
const toArrayFromCsv = (text) => {
  if (text == null) {
    return [];
  }

  return text.split(',');
};

module.exports = toArrayFromCsv;
