import { param, validationResult, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';


module.exports = {
  pageIdRequired:  param('pageId').not().isEmpty().withMessage('page id is not included in the parameter'),
  ogpValidator: (crowi) => {

    return async(req:Request, res:Response, next:NextFunction) => {

      const { aclService, fileUploadService } = crowi;

      const { configManager } = crowi;
      const ogpUri = configManager.getConfig('crowi', 'app:ogpUri');

      if (ogpUri == null) return res.status(400).send('OGP URI for GROWI has not been setup');
      if (!fileUploadService.getIsUploadable()) return res.status(501).send('This GROWI can not upload file');
      if (!aclService.isGuestAllowedToRead()) return res.status(501).send('This GROWI is not public');

      const errors = validationResult(req);

      if (errors.isEmpty()) {
        return next();
      }

      // errors.array length is one bacause pageIdRequired is used
      const pageIdRequiredError: ValidationError = errors.array()[0];

      return res.status(400).send(pageIdRequiredError.msg);

    };
  },

};
