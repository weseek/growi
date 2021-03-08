const request = require('supertest');
const express = require('express');
const { getInstance } = require('../setup-crowi');

describe('healthcheck', () => {
  let crowi;
  let app;

  const getInfoForHealthMock = jest.fn(() => {
    return 'OK';
  });
  const resetErrorStatusMock = jest.fn();

  beforeAll(async() => {
    crowi = await getInstance();
    // get injected manual mocks express
    app = express();

    app.use('/', require('~/server/routes/apiv3/healthcheck')(crowi));
  });

  describe('/', () => {
    test('respond 200 when checkServices is not set', async() => {
      const response = await request(app).get('/');

      expect(app.response.apiv3Err).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.info).toBeUndefined();
      expect(resetErrorStatusMock).not.toHaveBeenCalled();
    });

    describe.each`
      checkServices          | expectedMongo | expectedSearchInfo   | resetErrorStatusCalledTimes
      ${['mongo']}           | ${'OK'}       | ${undefined}         | ${0}
      ${['search']}          | ${undefined}  | ${'OK'}              | ${1}
      ${['mongo', 'search']} | ${'OK'}       | ${'OK'}              | ${1}
    `('respond 200', ({
      checkServices, expectedMongo, expectedSearchInfo, resetErrorStatusCalledTimes,
    }) => {
      test(`when checkServices is "${checkServices}"`, async() => {
        crowi.models.Config = { findOne: () => {} };

        crowi.searchService = { isConfigured: true, getInfoForHealth: getInfoForHealthMock, resetErrorStatus: resetErrorStatusMock };

        const response = await request(app).get('/').query({ checkServices });

        expect(app.response.apiv3Err).not.toHaveBeenCalled();
        expect(response.statusCode).toBe(200);
        expect(response.body.info.mongo).toBe(expectedMongo);
        expect(response.body.info.searchInfo).toBe(expectedSearchInfo);
        expect(resetErrorStatusMock).toHaveBeenCalledTimes(resetErrorStatusCalledTimes);
      });
    });

    test('add healthcheck-mongodb-unhealthy to errors when can not connnect to MongoDB', async() => {
      crowi.models.Config = { findOne: () => { throw Error('connection error') } };

      const response = await request(app).get('/').query({ checkServices: ['mongo'] });

      expect(response.statusCode).toBe(200);
      expect(response.body.errors[0].message).toBe('MongoDB is not connectable - connection error');
      expect(response.body.errors[0].code).toBe('healthcheck-mongodb-unhealthy');
    });

    test('add healthcheck-search-unhealthy to errors when unhealthy search', async() => {
      crowi.models.Config = { findOne: () => {} };

      crowi.searchService = { isConfigured: true, getInfoForHealth: () => { throw Error('unhealthy search') } };

      const response = await request(app).get('/').query({ checkServices: ['mongo', 'search'] });

      expect(response.statusCode).toBe(200);
      expect(response.body.info.mongo).toBe('OK');
      expect(response.body.errors[0].message).toBe('The Search Service is not connectable - unhealthy search');
      expect(response.body.errors[0].code).toBe('healthcheck-search-unhealthy');
    });

    test('http status is 503 when strictly is set', async() => {
      crowi.searchService = { isConfigured: true, getInfoForHealth: () => { throw Error('unhealthy search') } };
      crowi.models.Config = { findOne: () => { throw Error('connection error') } };

      const response = await request(app).get('/').query({ checkServices: ['mongo', 'search'], strictly: true });

      expect(response.statusCode).toBe(503);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});
