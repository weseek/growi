const logger = require('@alias/logger')('growi:middlewares:formValid');
const { validationResult } = require('express-validator/check');

const formValid = (crowi) => {
  const { ErrorV3 } = crowi.models;

  return function(req, res, next) {
    const errObjArray = validationResult(req);
    if (errObjArray.isEmpty()) {
      return next();
    }

    const errs = errObjArray.array().map((err) => {
      logger.error(`${err.param} in ${err.location}: ${err.msg}`);
      const errrr = new ErrorV3(`${err.param}: ${err.msg}`, 'validation_failed');
      return errrr;
    });

    return res.apiv3Err(errs);
  };
};

module.exports = formValid;
