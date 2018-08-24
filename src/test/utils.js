'use strict';

const mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test'
  , mongoose= require('mongoose')
  , fs = require('fs')
  , helpers = require('@commons/util/helpers')
  , Crowi = require('@server/crowi')
  , crowi = new Crowi(helpers.root(), process.env)
  , models = {}
  ;

mongoose.Promise = global.Promise;

before('Create database connection and clean up', function (done) {
  if (!mongoUri) {
    return done();
  }

  mongoose.connect(mongoUri);

  function clearDB() {
    for (var i in mongoose.connection.collections) {
      mongoose.connection.collections[i].remove(function() {});
    }
    return done();
  }

  if (mongoose.connection.readyState === 0) {
    mongoose.connect(mongoUri, function (err) {
      if (err) {
        throw err;
      }
      return clearDB();
    });
  } else {
    return clearDB();
  }
});

after('Close database connection', function (done) {
  if (!mongoUri) {
    return done();
  }

  mongoose.disconnect();
  return done();
});

// Setup Models
fs.readdirSync(helpers.root('src/server/models')).forEach(function(file) {
  if (file.match(/^([\w-]+)\.js$/)) {
    let name = RegExp.$1;
    if (name === 'index') {
      return;
    }
    let modelName = '';
    name.split('-').map(splitted => {
      modelName += (splitted.charAt(0).toUpperCase() + splitted.slice(1));
    });
    models[modelName] = require(`@server/models/${file}`)(crowi);
  }
});

crowi.models = models;

module.exports = {
  models: models,
  mongoose: mongoose,
};
