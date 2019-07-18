/* eslint-disable arrow-body-style */

const { getInstance } = require('../setup-crowi');

describe('middlewares.loginRequired', () => {
  let crowi;
  let middlewares;

  beforeEach(async(done) => {
    crowi = await getInstance();
    middlewares = require('@server/util/middlewares')(crowi, null);
    done();
  });

  // test('returns strict middlware when args is undefined', () => {
  //   const func = middlewares.loginRequired();
  //   expect(func).toBe(loginRequiredStrict);
  // });

  describe('not strict mode', () => {
    // setup req/res/next
    const req = {
      originalUrl: 'original url 1',
      session: {},
    };
    const res = {
      redirect: jest.fn().mockReturnValue('redirect'),
    };
    const next = jest.fn().mockReturnValue('next');

    let loginRequired;

    beforeEach(async(done) => {
      loginRequired = middlewares.loginRequired(false);
      done();
    });

    test('passes guest user when aclService.isGuestAllowedToRead() returns true', () => {
      // prepare spy for AclService.isGuestAllowedToRead
      const isGuestAllowedToReadSpy = jest.spyOn(crowi.aclService, 'isGuestAllowedToRead')
        .mockImplementation(() => true);

      const result = loginRequired(req, res, next);

      expect(isGuestAllowedToReadSpy).toHaveBeenCalledTimes(1);
      expect(next).toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(result).toBe('next');
    });

    test('redirect to \'/login\' when aclService.isGuestAllowedToRead() returns false', () => {
      // prepare spy for AclService.isGuestAllowedToRead
      const isGuestAllowedToReadSpy = jest.spyOn(crowi.aclService, 'isGuestAllowedToRead')
        .mockImplementation(() => false);

      const result = loginRequired(req, res, next);

      expect(isGuestAllowedToReadSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(result).toBe('redirect');
    });

  });


  describe('strict mode', () => {
    // setup req/res/next
    const req = {
      originalUrl: 'original url 1',
      session: {},
    };
    const res = {
      redirect: jest.fn().mockReturnValue('redirect'),
      sendStatus: jest.fn().mockReturnValue('sendStatus'),
    };
    const next = jest.fn().mockReturnValue('next');

    let loginRequired;
    let isGuestAllowedToReadSpy;

    beforeEach(async(done) => {
      loginRequired = middlewares.loginRequired();
      // spy for AclService.isGuestAllowedToRead
      isGuestAllowedToReadSpy = jest.spyOn(crowi.aclService, 'isGuestAllowedToRead');
      done();
    });

    test('send status 403 when \'req.path\' starts with \'_api\'', () => {
      req.path = '/_api/someapi';

      const result = loginRequired(req, res, next);

      expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
      expect(result).toBe('sendStatus');
    });

  });

});
