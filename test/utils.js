'use strict';

var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || null
  , mongoose= require('mongoose')
  , models = {}
  , crowi = new (require(ROOT_DIR + '/lib/crowi'))(ROOT_DIR, process.env)
  ;


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


models.Page     = require(MODEL_DIR + '/page.js')(crowi);
models.User     = require(MODEL_DIR + '/user.js')(crowi);
models.Config   = require(MODEL_DIR + '/config.js')(crowi);
models.Revision = require(MODEL_DIR + '/revision.js')(crowi);
models.UpdatePost = require(MODEL_DIR + '/updatePost.js')(crowi);

crowi.models = models;

module.exports = {
  models: models,
  mongoose: mongoose,
}
