import { HttpError } from 'http-errors';

const isHttpError = (val) => {
  if (!val || typeof val !== 'object') {
    return false;
  }

  if (val instanceof HttpError) {
    return true;
  }

  return val instanceof Error
    && typeof val.expose === 'boolean'
    && typeof val.statusCode === 'number'
    && val.status === val.statusCode;
};

module.exports = async(err, req, res, next) => {
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
