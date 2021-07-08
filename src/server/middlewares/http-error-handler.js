
const { isHttpError } = require('http-errors');

module.exports = (err, req, res, next) => {
  // handle if the err is a HttpError instance
  if (isHttpError(err)) {
    const httpError = err;

    return res
      .status(httpError.status)
      .send({
        status: httpError.status,
        message: httpError.message,
      });
  }

  next(err);
};
