module.exports = (crowi, app) => {
  // const { configManager } = crowi;

  // when disabled
  // if (!configManager.getConfig('crowi', 'promster:isEnabled')) {
  //   return (req, res, next) => next();
  // }

  // const { createMiddleware } = require('@promster/express');
  // return createMiddleware({ app });
  console.log('middleware');
  return (req, res, next) => next();
};
