'use strict';

var express = require('express')
  , async = require('async')
  , mongoose= require('mongoose')
  , ROOT_DIR = __dirname + '/..'
  , MODEL_DIR = __dirname + '/../lib/models'
  , mongoUri
  , testDBUtil
  ;

mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || null;


testDBUtil = {
  generateFixture: function (conn, model, fixture, cb) {
    var m = conn.model(model);
    async.each(fixture, function(data, next) {
      var newDoc = new m;

      Object.keys(data).forEach(function(k) {
        newDoc[k] = data[k];
      });
      newDoc.save(next);

    }, function(err) {
      cb();
    });
  },
  cleanUpDb: function (conn, model, cb) {
    if (!model) {
      return cb(null, null);
    }

    var m = conn.model(model);
    m.remove({}, cb);
  },
};

global.express = express;
global.mongoose = mongoose;
global.mongoUri = mongoUri;
global.ROOT_DIR = ROOT_DIR;
global.MODEL_DIR = MODEL_DIR;
global.testDBUtil = testDBUtil;
