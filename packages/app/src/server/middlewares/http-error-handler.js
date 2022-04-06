import { HttpError } from 'http-errors';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middleware:htto-error-handler');

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

    try {
      return res
        .status(httpError.status)
        .send({
          status: httpError.status,
          message: httpError.message,
        });
    }
    catch (err) {
      logger.error('Cannot call res.send() twice:', err);
    }
  }

  next(err);
};
