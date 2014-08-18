module.exports = function(app) {
  var models = {};

  require('./page')(models);
  require('./user')(models);
  require('./revision')(models);
  require('./bookmark')(models);

  app.set('models', models);

  return models;
};
