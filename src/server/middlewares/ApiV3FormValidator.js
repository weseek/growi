const logger = require('@alias/logger')('growi:middlewares:ApiV3FormValidator');
const { validationResult } = require('express-validator/check');

const ErrorV3 = require('../models/vo/error-apiv3');

class ApiV3FormValidator {

  constructor(crowi) {
    return (req, res, next) => {
      logger.debug('req.query', req.query);
      logger.debug('req.params', req.params);
      logger.debug('req.body', req.body);

      const errObjArray = validationResult(req);
      if (errObjArray.isEmpty()) {
        return next();
      }

      const errs = errObjArray.array().map((err) => {
        logger.error(`${err.location}.${err.param}: ${err.value} - ${err.msg}`);
        return new ErrorV3(`${err.param}: ${err.msg}`, 'validation_failed');
      });

      return res.apiv3Err(errs);
    };
  }

}

module.exports = ApiV3FormValidator;
