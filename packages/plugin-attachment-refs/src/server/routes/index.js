module.exports = (crowi, app) => {
  // add routes
  app.use('/_api/plugin', require('./refs')(crowi, app));
};
