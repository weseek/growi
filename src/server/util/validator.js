const validators = {};

validators.toPagingLimit = (_value) => {
  const value = parseInt(_value);
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(value) && isFinite(value) ? value : 20;
};

validators.toPagingOffset = (_value) => {
  const value = parseInt(_value);
  // eslint-disable-next-line no-restricted-globals
  return !isNaN(value) && isFinite(value) ? value : 0;
};

module.exports = validators;
