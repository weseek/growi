const { getInstance } = require('../setup-crowi');

const request = require("supertest");
const express = require("express");

describe('healthcheck', () => {
  let crowi;
  let app;

  beforeAll(async() => {
    crowi = await getInstance();
    app = express();
    app.use('/', require("~/server/routes/apiv3/healthcheck")(crowi));
  });

  describe('/', () => {
    test('respond 200 when no set connectToMiddlewares and checkMiddlewaresStrictly', async() => {
      const response = await request(app).get("/")
      expect(response.statusCode).toBe(200);
    })
  })
});
