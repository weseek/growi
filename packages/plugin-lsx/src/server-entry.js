module.exports = (crowi, app) => {
  // add routes
  require('./server/routes')(crowi, app);
};
