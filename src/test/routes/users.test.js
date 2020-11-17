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
    app.use('/', require('~/server/routes/apiv3/users')(crowi));
  });

  describe('GET /', () => {
    describe('when normal execution User.paginate', () => {
      beforeAll(() => {
        crowi.models.User.paginate = jest.fn();
      });
      /* eslint-disable indent */
      test.each`
        page  | selectedStatusList  | searchText  | sortOrder  | sort
        ${1}  | ${'all'}            | ${''}       | ${'asc'}   | ${'id'}
      `(
        'respond 200 when queries are { page: $page, selectedStatusList[]: $selectedStatusList, searchText: $searchText, sortOrder: $sortOrder, sort: $sort, }',
        async({
          page, selectedStatusList, searchText, sortOrder, sort,
        }) => {
          const response = await request(app).get('/').query({
            page, 'selectedStatusList[]': selectedStatusList, searchText, sortOrder, sort,
          });
          expect(app.response.apiv3Err).not.toHaveBeenCalled();
          expect(response.statusCode).toBe(200);
          expect(crowi.models.User.paginate).toHaveBeenCalled();
          expect(crowi.models.User.paginate.mock.calls[0]).toEqual(
            expect.arrayContaining(
              [
                {
                  $and: [
                    {
                      status: {
                        $in: [
                          crowi.models.User.STATUS_REGISTERED,
                          crowi.models.User.STATUS_ACTIVE,
                          crowi.models.User.STATUS_SUSPENDED,
                          crowi.models.User.STATUS_INVITED,
                        ],
                      },
                    },
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
                  select: crowi.models.User.USER_PUBLIC_FIELDS,
                },
              ],
            ),
          );
        },
      );
      /* eslint-disable indent */
      });
    describe('when throw Error from User.paginate', () => {
      beforeAll(() => {
        crowi.models.User.paginate = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('user-group-list-fetch-failed');
        expect(response.body.errors.message).toBe('Error occurred in fetching user group list');

      });
    });
    describe('validator.statusList', () => {
      test('respond 400 when invalid selectedStatusList', async() => {
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

  describe.skip('GET /:id/recent', () => {

  });

  describe.skip('GET /exists', () => {

  });

  describe.skip('POST /invite', () => {

  });

  describe.skip('PUT /:id/giveAdmin', () => {

  });

  describe.skip('PUT /:id/removeAdmin', () => {

  });

  describe.skip('PUT /:id/activate', () => {

  });

  describe.skip('PUT /:id/deactivate', () => {

  });

  describe.skip('DELETE /:id/remove', () => {

  });

  describe.skip('GET /external-accounts/', () => {

  });

  describe.skip('DELETE /external-accounts/:id/remove', () => {

  });

  describe.skip('PUT /update.imageUrlCache', () => {

  });

  describe.skip('PUT /reset-password', () => {

  });
});
