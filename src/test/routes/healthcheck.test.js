const { getInstance } = require('../setup-crowi');
const request = require("supertest");
const express = require("express");

describe('healthcheck', () => {
  let crowi;
  let app;

  beforeAll(async() => {
    crowi = await getInstance();
    app = express();
    // mocking apiv3Err
    app.response.apiv3Err = jest.fn(
      function(errors, status = 400, info) { // not arrow function
        this.status(status).json({ errors, info });
      }
    );

    app.use('/', require("~/server/routes/apiv3/healthcheck")(crowi));
  });

  describe('/', () => {
    test('respond 200 when no set connectToMiddlewares and checkMiddlewaresStrictly', async() => {
      const response = await request(app).get("/")
      expect(app.response.apiv3Err).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
    })

    test('add healthcheck-mongodb-unhealthy to errors when can not connnect to MongoDB', async() => {
      crowi.searchService = { isConfigured: false }
      crowi.models.Config = { findOne: () => { throw Error('connection error') } };

      const response = await request(app).get("/").query({ connectToMiddlewares: true,  })

      expect(response.statusCode).toBe(200);
      expect(response.body.errors[0].message).toBe('MongoDB is not connectable - connection error');
      expect(response.body.errors[0].code).toBe('healthcheck-mongodb-unhealthy');
      expect(response.body.info).toStrictEqual({});
    })
  })
});
