module.exports = (crowi, app) => {
  const { configManager } = crowi;

  if (!configManager.getConfig('crowi', 'promister:isEnabled')) {
    return null;
  }

  const { createMiddleware } = require('@promster/express');
  return createMiddleware({ app });
};
