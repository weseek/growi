'use strict';

process.env.NODE_ENV = 'test';

require('module-alias/register');

var express = require('express')
  , ROOT_DIR = __dirname + '/../..'
  , MODEL_DIR = __dirname + '/../../src/server/models'
  , testDBUtil
  ;

testDBUtil = {
  generateFixture: function(conn, model, fixture) {
    if (conn.readyState == 0) {
      return Promise.reject();
    }
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
  }
};

global.express = express;
global.ROOT_DIR = ROOT_DIR;
global.MODEL_DIR = MODEL_DIR;
global.testDBUtil = testDBUtil;
