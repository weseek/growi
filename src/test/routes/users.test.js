const request = require('supertest');
const express = require('express');
const { getInstance } = require('../setup-crowi');

describe('users', () => {
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
    crowi.models.User.STATUS_REGISTERED = 1;
    crowi.models.User.STATUS_ACTIVE = 2;
    crowi.models.User.STATUS_SUSPENDED = 3;
    crowi.models.User.STATUS_INVITED = 5;
    crowi.models.User.USER_PUBLIC_FIELDS = 'fields';
    app.use('/', require('~/server/routes/apiv3/users')(crowi));
  });

  describe('/', () => {
    beforeEach(() => {
      crowi.models.User.paginate = jest.fn();
    });
    test('respond 200 when valid queries', async() => {
      const response = await request(app).get('/').query({
        page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
      });

      expect(app.response.apiv3Err).not.toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      expect(crowi.models.User.paginate).toHaveBeenCalled();
      expect(crowi.models.User.paginate.mock.calls[0]).toEqual(
        expect.arrayContaining(
          [
            {
              $and: [
                { status: { $in: [1, 2, 3, 5] } },
                {
                  $or: [
                    { name: { $in: /(?:)/ } },
                    { username: { $in: /(?:)/ } },
                    { email: { $in: /(?:)/ } },
                  ],
                },
              ],
            },
            {
              sort: { id: 1 },
              page: 1,
              limit: 50,
              select: 'fields',
            },
          ],
        ),
      );
    });
    describe('respond 400 when validator.statusList', () => {
      test('invalid selectedStatusList', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'hoge', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'selectedStatusList: Invalid value' }]);

      });
      test('respond 400 when invalid sortOrder', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'hoge',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'sortOrder: Invalid value' }]);

      });
      test('respond 400 when invalid sort', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'hoge', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'sort: Invalid value' }]);

      });
      test('respond 400 when invalid page', async() => {
        const response = await request(app).get('/').query({
          page: 'hoge', 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'page: Invalid value' }]);
      });
    });
  });
});
