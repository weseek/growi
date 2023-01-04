export const generateCertifyBrandLogoMiddleware = (crowi) => {

  return async(req, res, next) => {

    const { attachmentService } = crowi;
    const isBrandLogoExist = await attachmentService.isBrandLogoExist();

    if (isBrandLogoExist) {
      req.isBrandLogo = true;
    }

    next();
  };

};
