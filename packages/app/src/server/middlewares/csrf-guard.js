import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:middlewares:csrf-guard');

module.exports = () => {

  return async(req, res, next) => {
    if (req.method === 'PUT' || req.method === 'POST') {
      if (req.rawHeaders.includes('x-growi-client') === true ) {
        return next();
      }
      else {
        logger.error('Request authorization failed');
        return;
      }
    }
    else {
      return next();
    }
  };

};
