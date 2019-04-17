
const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test';
const mongoose = require('mongoose');
const fs = require('fs');
const helpers = require('@commons/util/helpers');
const Crowi = require('@server/crowi');

const crowi = new Crowi(helpers.root(), process.env);

const models = {};

mongoose.Promise = global.Promise;

before('Create database connection and clean up', (done) => {
  if (!mongoUri) {
    return done();
  }

  mongoose.connect(mongoUri, { useNewUrlParser: true });

  function clearDB() {
    Object.values(mongoose.connection.collections).forEach((collection) => {
      collection.remove(() => {});
    });
    return done();
  }

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(mongoUri, { useNewUrlParser: true }, (err) => {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  }

  return clearDB();
});

after('Close database connection', (done) => {
  if (!mongoUri) {
    return done();
  }

  mongoose.disconnect();
  return done();
});

// Setup Models
fs.readdirSync(helpers.root('src/server/models')).forEach((file) => {
  if (file.match(/^([\w-]+)\.js$/)) {
    const name = RegExp.$1;
    if (name === 'index') {
      return;
    }
    let modelName = '';
    name.split('-').forEach((splitted) => {
      modelName += (splitted.charAt(0).toUpperCase() + splitted.slice(1));
    });
    models[modelName] = require(`@server/models/${file}`)(crowi);
  }
});

crowi.models = models;

module.exports = {
  models,
  mongoose,
};
