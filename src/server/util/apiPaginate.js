'use strict';

const LIMIT_DEFAULT = 50;
const LIMIT_MAX = 1000;

const OFFSET_DEFAULT = 0;

const DEFAULT_MAX_RESULT_WINDOW = 10000;

const parseIntValue = function(value, defaultValue, maxLimit) {
  if (!value) {
    return defaultValue;
  }

  let v = parseInt(value);
  if (!maxLimit) {
    return v;
  }

  return v <= maxLimit ? v : maxLimit;
};

function ApiPaginate() {}

ApiPaginate.parseOptionsForElasticSearch = function(params) {
  let limit = parseIntValue(params.limit, LIMIT_DEFAULT, LIMIT_MAX);
  let offset = parseIntValue(params.offset, OFFSET_DEFAULT);

  // See https://github.com/crowi/crowi/pull/293
  if (limit + offset > DEFAULT_MAX_RESULT_WINDOW) {
    throw new Error(`(limit + offset) must be less than or equal to ${DEFAULT_MAX_RESULT_WINDOW}`);
  }

  return { limit: limit, offset: offset };
};

ApiPaginate.parseOptions = function(params) {
  let limit = parseIntValue(params.limit, LIMIT_DEFAULT, LIMIT_MAX);
  let offset = parseIntValue(params.offset, OFFSET_DEFAULT);

  return { limit: limit, offset: offset };
};

module.exports = ApiPaginate;
