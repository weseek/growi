const request = require('supertest');
const express = require('express');
const { getInstance } = require('../setup-crowi');

describe('admin-home', () => {
  let crowi;
  let app;

  beforeAll(async() => {
    crowi = await getInstance();
    // get injected manual mocks express
    app = express();
    jest.mock('~/server/middlewares/login-required');
    const loginRequired = require('~/server/middlewares/login-required');
    loginRequired.mockImplementation(() => {
      return function(_req, _res, next) {
        next();
      };
    });
    jest.mock('~/server/middlewares/admin-required');
    const adminRequired = require('~/server/middlewares/admin-required');
    adminRequired.mockImplementation(() => {
      return function(_req, _res, next) {
        next();
      };
    });

    jest.mock('~/server/plugins/plugin-utils', () => {
      return function() {
        return { listPlugins: () => { return 'listPlugins' } };
      };
    });

    jest.mock('~/server/service/config-loader', () => {
      return {
        getEnvVarsForDisplay: jest.fn(() => 'envVars'),
      };
    });


    app.use('/', require('~/server/routes/apiv3/admin-home')(crowi));
  });

  describe('GET /', () => {
    beforeAll(() => {
      crowi.version = 'growiVersion';
    });
    describe('exist node, npm and yarn version', () => {
      beforeAll(() => {
        crowi.runtimeVersions = {
          versions: {
            node: { version: { version: 'nodeVersion' } },
            npm: { version: { version: 'npmVersion' } },
            yarn: { version: { version: 'yarnVersion' } },
          },
        };
      });
      test('respond 200', async() => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toMatchObject(
          {
            adminHomeParams: {
              growiVersion: 'growiVersion',
              nodeVersion: 'nodeVersion',
              npmVersion: 'npmVersion',
              yarnVersion: 'yarnVersion',
              installedPlugins: 'listPlugins',
              envVars: 'envVars',
            },
          },
        );
      });
    });
    describe('not exist node, npm and yarn version', () => {
      beforeAll(() => {
        crowi.runtimeVersions = {
          versions: {},
        };
      });
      test('respond 200', async() => {
        const response = await request(app).get('/');
        expect(response.statusCode).toBe(200);
        expect(response.body.data).toMatchObject(
          {
            adminHomeParams: {
              growiVersion: 'growiVersion',
              nodeVersion: '-',
              npmVersion: '-',
              yarnVersion: '-',
              installedPlugins: 'listPlugins',
              envVars: 'envVars',
            },
          },
        );
      });
    });
  });
});
