process.env.NODE_ENV = 'test';

require('module-alias/register');

const helpers = require('@commons/util/helpers');

const express = require('express');

const testDBUtil = {
  generateFixture(conn, model, fixture) {
    if (conn.readyState === 0) {
      return Promise.reject();
    }
    const m = conn.model(model);

    return new Promise(((resolve) => {
      const createdModels = [];
      fixture.reduce((promise, entity) => {
        return promise.then(() => {
          const newDoc = new m(); // eslint-disable-line new-cap

          Object.keys(entity).forEach((k) => {
            newDoc[k] = entity[k];
          });
          return new Promise(((r) => {
            newDoc.save((err, data) => {
              createdModels.push(data);
              return r();
            });
          }));
        });
      }, Promise.resolve()).then(() => {
        resolve(createdModels);
      });
    }));
  },
};

global.express = express;
global.ROOT_DIR = helpers.root();
global.MODEL_DIR = helpers.root('src/server/models');
global.testDBUtil = testDBUtil;
