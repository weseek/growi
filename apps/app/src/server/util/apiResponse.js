function ApiResponse() {
}

ApiResponse.error = function(err, code, data) {
  const result = {};

  result.ok = false;
  result.code = code;
  result.data = data;

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
