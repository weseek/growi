import User from '~/server/models/user';

const request = require('supertest');
const express = require('express');
const { getInstance } = require('../setup-crowi');


const dummyUser = { username: 'user1' };
const dummyAdminUser = { username: 'admin1', admin: true };

const generateAppWithUser = (crowi, user) => {
  return express()
    .use((req, res, next) => {
      req.user = user;
      next();
    })
    .use('/', require('~/server/routes/apiv3/users')(crowi));
};

describe('users', () => {
  let crowi;

  beforeAll(async() => {
    crowi = await getInstance();

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

    jest.mock('~/server/middlewares/access-token-parser');
    const accessTokenParser = require('~/server/middlewares/access-token-parser');
    accessTokenParser.mockImplementation(() => {
      return function(req, _res, next) {
        next();
      };
    });

  });

  describe('GET /', () => {
    describe('when normal execution User.paginate', () => {
      let app;

      beforeAll(() => {
        app = generateAppWithUser(crowi, dummyAdminUser);
        User.paginate = jest.fn().mockImplementation(() => {
          const paginateResult = {
            docs: [
              { username: 'admin', email: 'admin@example.com' },
            ],
          };
          return paginateResult;
        });
      });

      /* eslint-disable indent */
      test.each`
        page  | selectedStatusList  | searchText  | sortOrder  | sort     | searchWord  | sortQuery | statusNoList
        ${1}  | ${['registered']}   | ${''}       | ${'asc'}   | ${'id'}  | ${/(?:)/}   | ${1}      | ${[1]}
        ${1}  | ${['all']}          | ${''}       | ${'asc'}   | ${'id'}  | ${/(?:)/}   | ${1}      | ${[1, 2, 3, 5]}
        ${1}  | ${['registered']}   | ${'hoge'}   | ${'asc'}   | ${'id'}  | ${/hoge/}   | ${1}      | ${[1]}
        ${1}  | ${['registered']}   | ${''}       | ${'desc'}  | ${'id'}  | ${/(?:)/}   | ${-1}     | ${[1]}
      `(
        'respond 200 when queries are { page: $page, selectedStatusList[]: $selectedStatusList, searchText: $searchText, sortOrder: $sortOrder, sort: $sort }',
        async({
          page, selectedStatusList, searchText, sortOrder, sort, searchWord, sortQuery, statusNoList,
        }) => {
          const response = await request(app).get('/').query({
            page, 'selectedStatusList[]': selectedStatusList, searchText, sortOrder, sort,
          });
          expect(app.response.apiv3Err).not.toHaveBeenCalled();
          expect(response.statusCode).toBe(200);
          expect(User.paginate).toHaveBeenCalled();
          expect(User.paginate.mock.calls[0]).toMatchObject(
            [
              {
                $and: [
                  {
                    status: {
                      $in: statusNoList,
                    },
                  },
                  {
                    $or: [
                      { name: { $in: searchWord } },
                      { username: { $in: searchWord } },
                      {
                        $and: [
                          { isEmailPublished: true },
                          { email: { $in: searchWord } },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                sort: { [sort]: sortQuery },
                page,
                limit: 50,
              },
            ],
          );
        },
      );
      /* eslint-disable indent */
    });

    describe('when throw Error from User.paginate', () => {
      let app;

      beforeAll(() => {
        app = generateAppWithUser(crowi, dummyAdminUser);
        User.paginate = jest.fn().mockImplementation(() => { throw Error('error') });
      });

      test('respond 500', async() => {
        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'all', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('user-group-list-fetch-failed');
        expect(response.body.errors.message).toBe('Error occurred in fetching users data');
      });
    });

    describe('validator.statusList by not admin user', () => {
      let app;

      test('respond 400 when the user specified selectedStatusList', async() => {
        app = generateAppWithUser(crowi, dummyUser);

        const response = await request(app).get('/').query({
          page: 1, 'selectedStatusList[]': 'hoge', sort: 'id', sortOrder: 'asc',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{
          code: 'validation_failed',
          message: 'selectedStatusList: the param \'selectedStatusList\' is not allowed to use by the users except administrators',
        }]);
      });
    });

    describe('validator.statusList by admin user', () => {
      let app;

      beforeAll(() => {
        app = generateAppWithUser(crowi, dummyAdminUser);
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

  describe('GET /:id/recent', () => {
    let app;

    beforeAll(async() => {
      app = generateAppWithUser(crowi, dummyUser);
    });

    describe('normal test', () => {
      beforeAll(() => {
        User.findById = jest.fn().mockImplementation(() => { return 'user' });
        const toObjectMock = jest.fn().mockImplementation(() => { return 'userObject' });
        crowi.models.Page.findListByCreator = jest.fn().mockImplementation(() => { return { pages: [{ lastUpdateUser: { toObject: toObjectMock } }] } });
      });
      test('respond 200 when set query limit', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1, limit: 10,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', dummyUser, { offset: 0, limit: 10 }],
        );
        expect(response.statusCode).toBe(200);
      });
      test('respond 200 when no set limit and set customize:showPageLimitationM', async() => {
        crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return 20 });

        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', dummyUser, { offset: 0, limit: 20 }],
        );
        expect(response.statusCode).toBe(200);
      });
      test('respond 200 when no set limit and no set customize:showPageLimitationM', async() => {
        crowi.configManager.getConfig = jest.fn().mockImplementation(() => { return null });

        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });

        expect(crowi.models.Page.findListByCreator.mock.calls[0]).toMatchObject(
          ['user', dummyUser, { offset: 0, limit: 30 }],
        );
        expect(response.statusCode).toBe(200);
      });
    });

    describe('validator.recentCreatedByUser', () => {
      test('respond 400 when limit is larger then 300', async() => {
        const response = await request(app).get('/userId/recent').query({
          limit: 500,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toMatchObject([{ code: 'validation_failed', message: 'limit: You should set less than 300 or not to set limit.' }]);
      });
    });

    describe('when throw Error from User.findById', () => {
      beforeAll(() => {
User.findById = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('retrieve-recent-created-pages-failed');
        expect(response.body.errors.message).toBe('Error occurred in find user');
      });
    });

    describe('when dont return user from User.findById', () => {
      beforeAll(() => {
User.findById = jest.fn().mockImplementation(() => { return null });
      });
      test('respond 400', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors.message).toBe('find-user-is-not-found');
      });
    });

    describe('when throw Error from Page.findListByCreator', () => {
      beforeAll(() => {
        User.findById = jest.fn().mockImplementation(() => { return 'user' });
        crowi.models.Page.findListByCreator = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 500', async() => {
        const response = await request(app).get('/userId/recent').query({
          page: 1,
        });
        expect(response.statusCode).toBe(500);
        expect(response.body.errors.code).toBe('retrieve-recent-created-pages-failed');
        expect(response.body.errors.message).toBe('Error occurred in retrieve recent created pages for user');
      });
    });
  });

  describe('GET /exists', () => {
    let app;

    beforeAll(async() => {
      app = generateAppWithUser(crowi, dummyUser);
    });

    describe('when exists user', () => {
      beforeAll(() => {
User.findUserByUsername = jest.fn().mockImplementation(() => { return 'user' });
      });
      test('respond exists true', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data.exists).toBe(true);
      });
    });

    describe('when no exists user', () => {
      beforeAll(() => {
User.findUserByUsername = jest.fn().mockImplementation(() => { return null });
      });
      test('respond exists false', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.data.exists).toBe(false);
      });
    });

    describe('when throw Error from User.findUserByUsername', () => {
      beforeAll(() => {
        User.findUserByUsername = jest.fn().mockImplementation(() => { throw Error('error') });
      });
      test('respond 400', async() => {
        const response = await request(app).get('/exists').query({
          username: 'hoge',
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
    });

    describe('validator.exists', () => {
      test('respond 400 when username is not string', async() => {
        const response = await request(app).get('/exists').query({
          username: 1,
        });
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
      test('respond 400 when username is empty', async() => {
        const response = await request(app).get('/exists');
        expect(response.statusCode).toBe(400);
        expect(response.body.errors).toBeDefined();
      });
    });
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
