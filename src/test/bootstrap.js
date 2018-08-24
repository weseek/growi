'use strict';

process.env.NODE_ENV = 'test';

require('module-alias/register');

const helpers = require('@commons/util/helpers');

const express = require('express');

let testDBUtil;

testDBUtil = {
  generateFixture: function(conn, model, fixture) {
    if (conn.readyState == 0) {
      return Promise.reject();
    }
    const m = conn.model(model);

    return new Promise(function(resolve, reject) {
      const createdModels = [];
      fixture.reduce(function(promise, entity) {
        return promise.then(function() {
          const newDoc = new m;

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
global.ROOT_DIR = helpers.root();
global.MODEL_DIR = helpers.root('src/server/models');
global.testDBUtil = testDBUtil;
