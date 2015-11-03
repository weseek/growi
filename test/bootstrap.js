'use strict';

var express = require('express')
  , async = require('async')
  , mongoose= require('mongoose')
  , ROOT_DIR = __dirname + '/..'
  , MODEL_DIR = __dirname + '/../lib/models'
  , Promise = require('bluebird')
  , mongoUri
  , testDBUtil
  ;

mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || process.env.MONGO_URI || null;


testDBUtil = {
  generateFixture: function (conn, model, fixture) {
    var m = conn.model(model);

    return new Promise(function(resolve, reject) {
      var createdModels = [];
      fixture.reduce(function(promise, entity) {
        return promise.then(function() {
          var newDoc = new m;

          Object.keys(entity).forEach(function(k) {
            newDoc[k] = entity[k];
          });

          return new Promise(function(r, rj) {
            newDoc.save(function(err, data) {
              createdModels.push(data);
              return r();
            });
          });
        });
      }, Promise.resolve()).then(function() {
        resolve(createdModels);
      });
    });
  },
  cleanUpDb: function (conn, models) {
    return new Promise(function(resolve, reject) {
      if (Array.isArray(models)) {
        models.reduce(function(promise, model) {
          return promise.then(function() {
            var m = conn.model(model);
            return new Promise(function(r, rj) {
              m.remove({}, r);
            });
          });
        }, Promise.resolve()).then(function() {
          resolve();
        });
      } else {
        var m = conn.model(models);
        m.remove({}, resolve);
      }
    });
  },
};

global.express = express;
global.mongoose = mongoose;
global.mongoUri = mongoUri;
global.ROOT_DIR = ROOT_DIR;
global.MODEL_DIR = MODEL_DIR;
global.testDBUtil = testDBUtil;
