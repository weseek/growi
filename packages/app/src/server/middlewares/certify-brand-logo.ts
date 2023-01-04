export const generateCertifyBrandLogoMiddleware = (crowi) => {

  return async(req, res, next) => {

    const { attachmentService } = crowi;

    if (attachmentService.isBrandLogoExist()) {
      req.isBrandLogo = true;
    }

    next();
  };

};
