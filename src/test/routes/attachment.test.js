import Attachment from '~/server/models/attachment';

const request = require('supertest');
const express = require('express');

const { getInstance } = require('../setup-crowi');

describe('attachment', () => {
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
    jest.mock('~/server/middlewares/access-token-parser');
    const accessTokenParser = require('~/server/middlewares/access-token-parser');
    accessTokenParser.mockImplementation(() => {
      return function(req, _res, next) {
        req.user = 'loginUser';
        next();
      };
    });

    app.use('/', require('~/server/routes/apiv3/attachment')(crowi));
  });

  describe('GET /list', () => {
    describe('when accessible', () => {
      beforeAll(() => {
        crowi.models.Page.isAccessiblePageByViewer = jest.fn().mockImplementation(() => { return true });
      });
      describe('test limit', () => {
        beforeAll(() => {
          Attachment.paginate = jest.fn().mockImplementation(() => { return { docs: [] } });
        });
        test('respond 200 when set query limit', async() => {
          const response = await request(app).get('/list').query({
            pageId: '52fcf1060af12baf9e8d5bba', limit: 30, page: 1,
          });

          expect(Attachment.paginate.mock.calls[0]).toMatchObject(
            [
              { page: '52fcf1060af12baf9e8d5bba' },
              { limit: 30, offset: 0, populate: 'creator' },
            ],
          );
          expect(response.statusCode).toBe(200);
        });
        test('respond 200 when no set limit and set customize:showPageLimitationS', async() => {
          crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return 20 });

          const response = await request(app).get('/list').query({
            pageId: '52fcf1060af12baf9e8d5bba', page: 1,
          });

          expect(Attachment.paginate.mock.calls[0]).toMatchObject(
            [
              { page: '52fcf1060af12baf9e8d5bba' },
              { limit: 20, offset: 0, populate: 'creator' },
            ],
          );
          expect(response.statusCode).toBe(200);
        });
        test('respond 200 when no set limit and no set customize:showPageLimitationM', async() => {
          crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return null });

          const response = await request(app).get('/list').query({
            pageId: '52fcf1060af12baf9e8d5bba', page: 1,
          });

          expect(Attachment.paginate.mock.calls[0]).toMatchObject(
            [
              { page: '52fcf1060af12baf9e8d5bba' },
              { limit: 10, offset: 0, populate: 'creator' },
            ],
          );
          expect(response.statusCode).toBe(200);
        });
      });

      describe.skip('when exist docs and valid creater', () => {
        beforeAll(() => {
          // TODO: Mocking User instance to creator, because test instanceof operator
          Attachment.paginate = jest.fn().mockImplementation(() => { return { docs: [{ creator: 'creator' }] } });
        });
      });
      describe.skip('when exist docs and invalid creater', () => {
        beforeAll(() => {
          // TODO: Mocking User instance to creator, because test instanceof operator
          Attachment.paginate = jest.fn().mockImplementation(() => { return { docs: [{ creator: 'creator' }] } });
        });
      });
    });

    describe('validator.retrieveAttachments', () => {
      test('respond 400 when invalid pageId', async() => {
        const response = await request(app).get('/list');
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'pageId: pageId is required' }]);
      });
      test('respond 400 when invalid limit', async() => {
        const response = await request(app).get('/list').query({
          pageId: '52fcf1060af12baf9e8d5bba', limit: 300,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'limit: You should set less than 100 or not to set limit.' }]);

      });
    });

    describe('when throw Error from Page.isAccessiblePageByViewer', () => {
      beforeAll(() => {
        crowi.models.Page.isAccessiblePageByViewer = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/list').query({
          pageId: '52fcf1060af12baf9e8d5bba', limit: 300,
        });
      });
    });

    describe('when not accessible', () => {
      beforeAll(() => {
        crowi.models.Page.isAccessiblePageByViewer = jest.fn().mockImplementation(() => { return false });
      });
      test('respond 403', async() => {
        const response = await request(app).get('/list').query({
          pageId: '52fcf1060af12baf9e8d5bba',
        });
        expect(response.statusCode).toBe(403);
        expect(response.body.errors).toMatchObject({ code: 'attachment-list-failed', message: 'Current user is not accessible to this page.' });
      });
    });

  });
});
