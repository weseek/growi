'use strict';

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || 'mongodb://localhost/growi_test'
  , mongoose= require('mongoose')
  , fs = require('fs')
  , models = {}
  , crowi = new (require(ROOT_DIR + '/src/server/crowi'))(ROOT_DIR, process.env)
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
fs.readdirSync(MODEL_DIR).forEach(function(file) {
  if (file.match(/^([\w-]+)\.js$/)) {
    var name = RegExp.$1;
    if (name === 'index') {
      return;
    }
    var modelName = '';
    name.split('-').map(splitted => {
      modelName += (splitted.charAt(0).toUpperCase() + splitted.slice(1));
    });
    models[modelName] = require(MODEL_DIR + '/' + file)(crowi);
  }
});

crowi.models = models;

module.exports = {
  models: models,
  mongoose: mongoose,
}
