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
    let loginRequired;

    const req = {
      originalUrl: 'original url 1',
      session: {},
    };
    const res = {
      redirect: jest.fn().mockReturnValue('res'),
    };
    const next = jest.fn().mockReturnValue('next');

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

      // eslint-disable-next-line no-unused-vars
      const result = loginRequired(req, res, next);

      expect(isGuestAllowedToReadSpy).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });

  });

});
