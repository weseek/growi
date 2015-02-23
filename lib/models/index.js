module.exports = function(app) {
  var models = {};

  require('./page')(app, models);
  require('./user')(app, models);
  require('./revision')(app, models);
  require('./bookmark')(app, models);

  app.set('models', models);

  return models;
};
