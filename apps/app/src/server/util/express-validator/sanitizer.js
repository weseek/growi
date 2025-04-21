// custom sanitizers not covered by express-validator
// https://github.com/validatorjs/validator.js#sanitizers

const sanitizers = {};

sanitizers.toPagingLimit = (_value) => {
  const value = parseInt(_value);
  // biome-ignore lint/style/noRestrictedGlobals: ignore
  return !isNaN(value) && isFinite(value) ? value : 20;
};

sanitizers.toPagingOffset = (_value) => {
  const value = parseInt(_value);
  // biome-ignore lint/style/noRestrictedGlobals: ignore
  return !isNaN(value) && isFinite(value) ? value : 0;
};

module.exports = sanitizers;
