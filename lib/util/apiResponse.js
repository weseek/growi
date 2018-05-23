'use strict';

function ApiResponse() {
}

ApiResponse.error = function(err) {
  var result = {};

  result = {
    ok: false
  };

  if (err instanceof Error) {
    result.error = err.toString();
  }
  else {
    result.error = err;
  }

  return result;
};

ApiResponse.success = function(data) {
  var result = data || {};

  result.ok = true;
  return result;
};

module.exports = ApiResponse;
