/* eslint-disable arrow-body-style */

import each from 'jest-each';

const { getInstance } = require('../setup-crowi');

describe('middlewares', () => {
  let crowi;
  let middlewares;

  beforeEach(async(done) => {
    crowi = await getInstance();
    middlewares = require('@server/util/middlewares')(crowi, null);
    done();
  });

});
