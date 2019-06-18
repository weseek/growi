process.env.NODE_ENV = 'test';

const express = require('express');

const testDBUtil = {
  async generateFixture(conn, model, fixture) {
    if (conn.readyState === 0) {
      throw new Error();
    }
    const Model = conn.model(model);
    return Promise.all(fixture.map((entity) => {
      return new Model(entity).save();
    }));
  },
};

global.express = express;
global.testDBUtil = testDBUtil;
