import loggerFactory from '~/utils/logger';


const logger = loggerFactory('growi:middleware:certify-brand-logo-fire');

module.exports = (crowi) => {

  return async(req, res, next) => {

    const fileId = req.params.id || null;

    const Attachment = crowi.model('Attachment');

    const attachment = await Attachment.findOne({ _id: fileId });

    if (attachment == null) {
      return next();
    }

    if (attachment.isBrandLogo()) {
      req.isBrandLogo = true;
      return next();
    }

    next();
  };

};
