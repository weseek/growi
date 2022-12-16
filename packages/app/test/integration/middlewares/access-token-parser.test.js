const mongoose = require('mongoose');

const { getInstance } = require('../setup-crowi');

describe('accessTokenParser', () => {
  let crowi;
  let accessTokenParser;

  let User;
  let targetUser;

  beforeAll(async() => {
    crowi = await getInstance();
    User = mongoose.model('User');
    accessTokenParser = require('~/server/middlewares/access-token-parser')(crowi);

    targetUser = await User.create({
      name: 'Example for access token parser',
      username: 'targetUser',
      password: 'usertestpass',
      lang: 'en_US',
      apiToken: 'N4xPDjh48TBsC7ahUN+ajjL5asnGpwtA5VAR+EhIDeg=',
    });
  });

  crowi = {
    model: jest.fn().mockReturnValue(User),
  };
  const req = {
    query: {},
    body: {},
    user: {},
  };

  const res = {};
  const next = jest.fn().mockReturnValue('next');

  test('without accessToken', async() => {
    const result = await accessTokenParser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBe('next');
  });

  test('with invalid accessToken', async() => {
    req.query.access_token = 'invalidAccessToken';

    const result = await accessTokenParser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBe('next');
  });

  test('with accessToken in query', async() => {
    req.query.access_token = 'N4xPDjh48TBsC7ahUN+ajjL5asnGpwtA5VAR+EhIDeg=';

    const result = await accessTokenParser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBe('next');
    expect(req.user._id).toStrictEqual(targetUser._id);
  });

  test('with accessToken in body', async() => {
    req.body.access_token = 'N4xPDjh48TBsC7ahUN+ajjL5asnGpwtA5VAR+EhIDeg=';

    const result = await accessTokenParser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(result).toBe('next');
    expect(req.user._id).toStrictEqual(targetUser._id);
  });


});
