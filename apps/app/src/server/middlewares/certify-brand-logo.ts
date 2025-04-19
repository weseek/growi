import type Crowi from '../crowi';

export const generateCertifyBrandLogoMiddleware = (_crowi: Crowi) => {

  return async(req, _res, next) => {
    req.isBrandLogo = true;
    next();
  };

};
