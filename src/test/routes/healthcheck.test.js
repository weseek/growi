const { getInstance } = require('../setup-crowi');

const request = require("supertest");
const express = require("express");

describe('healthcheck', () => {
  let crowi;
  let app;

  beforeEach(async(done) => {
    crowi = await getInstance();
    app = express();
    app.use('/', require("~/server/routes/apiv3/healthcheck")(crowi));
    done();
  });

  describe('/', () => {
    test('hoge', async() => {
      const response = await request(app).get("/")
      expect(response.statusCode).toBe(200);
    })
  })
});
