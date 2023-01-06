export const generateCertifyBrandLogoMiddleware = (crowi) => {

  return async(req, res, next) => {
    req.isBrandLogo = true;
    next();
  };

};
