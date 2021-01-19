module.exports = (crowi, app) => {
  const { configManager } = crowi;

  // when disabled
  if (!configManager.getConfig('crowi', 'promister:isEnabled')) {
    return () => {};
  }

  const { createMiddleware } = require('@promster/express');
  return createMiddleware({ app });
};
