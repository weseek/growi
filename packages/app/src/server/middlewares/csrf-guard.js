import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:csrf-guard');

module.exports = () => {

  return async(req, res, next) => {
    if (req.rawHeaders.includes('X-Requested-With') === false ) {
      logger.error('Request authorization failed');
      return;
    }
    return next();
  };

};
