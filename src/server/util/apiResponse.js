'use strict';

function ApiResponse() {
}

ApiResponse.error = function(err, code) {
  const result = {};

  result.ok = false;
  result.code = code;

  if (err instanceof Error) {
    result.error = err.toString();
  }
  else {
    result.error = err;
  }

  return result;
};

ApiResponse.success = function(data) {
  const result = data || {};

  result.ok = true;
  return result;
};

module.exports = ApiResponse;
