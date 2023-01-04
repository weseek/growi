export const generateCertifyBrandLogo = (crowi) => {

  return async(req, res, next) => {

    const Attachment = crowi.model('Attachment');

    if (Attachment.isBrandLogoExist()) {
      req.isBrandLogo = true;
    }

    next();
  };

};
