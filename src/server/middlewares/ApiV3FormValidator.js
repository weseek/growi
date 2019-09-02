const logger = require('@alias/logger')('growi:middlewares:ApiV3FormValidator');
const { validationResult } = require('express-validator/check');

class ApiV3FormValidator {

  constructor(crowi) {
    const { ErrorV3 } = crowi.models;

    return (req, res, next) => {
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
