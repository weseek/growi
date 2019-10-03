/* eslint-disable arrow-body-style */

import each from 'jest-each';

const { getInstance } = require('../setup-crowi');

describe('loginRequired', () => {
  let crowi;
  let loginRequiredStrictly;
  let loginRequired;

  beforeEach(async(done) => {
    crowi = await getInstance();
    loginRequiredStrictly = require('@server/middleware/login-required')(crowi);
    loginRequired = require('@server/middleware/login-required')(crowi, true);
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

    test('pass guest user when aclService.isGuestAllowedToRead() returns true', () => {
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
      session: null,
    };
    const res = {
      redirect: jest.fn().mockReturnValue('redirect'),
      sendStatus: jest.fn().mockReturnValue('sendStatus'),
    };
    const next = jest.fn().mockReturnValue('next');

    let isGuestAllowedToReadSpy;

    beforeEach(async(done) => {
      // reset session object
      req.session = {};
      // spy for AclService.isGuestAllowedToRead
      isGuestAllowedToReadSpy = jest.spyOn(crowi.aclService, 'isGuestAllowedToRead');
      done();
    });

    test('send status 403 when \'req.path\' starts with \'_api\'', () => {
      req.path = '/_api/someapi';

      const result = loginRequiredStrictly(req, res, next);

      expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(res.sendStatus).toHaveBeenCalledTimes(1);
      expect(res.sendStatus).toHaveBeenCalledWith(403);
      expect(result).toBe('sendStatus');
    });

    test('redirect to \'/login\' when the user does not loggedin', () => {
      req.path = '/path/that/requires/loggedin';

      const result = loginRequiredStrictly(req, res, next);

      expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(result).toBe('redirect');
      expect(req.session.jumpTo).toBe('original url 1');
    });

    test('pass user who logged in', () => {
      const User = crowi.model('User');

      req.user = {
        _id: 'user id',
        status: User.STATUS_ACTIVE,
      };

      const result = loginRequiredStrictly(req, res, next);

      expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.redirect).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledTimes(1);
      expect(result).toBe('next');
      expect(req.session.jumpTo).toBe(undefined);
    });

    each`
      userStatus  | expectedPath
      ${1}        | ${'/login/error/registered'}
      ${3}        | ${'/login/error/suspended'}
      ${5}        | ${'/login/invited'}
    `
      .test('redirect to \'$expectedPath\''
        + ' when user.status is \'$userStatus\' ', ({ userStatus, expectedPath }) => {

        req.user = {
          _id: 'user id',
          status: userStatus,
        };

        const result = loginRequiredStrictly(req, res, next);

        expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
        expect(res.sendStatus).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledTimes(1);
        expect(res.redirect).toHaveBeenCalledWith(expectedPath);
        expect(result).toBe('redirect');
        expect(req.session.jumpTo).toBe(undefined);
      });

    test('redirect to \'/login\' when user.status is \'STATUS_DELETED\'', () => {
      const User = crowi.model('User');

      req.path = '/path/that/requires/loggedin';
      req.user = {
        _id: 'user id',
        status: User.STATUS_DELETED,
      };

      const result = loginRequiredStrictly(req, res, next);

      expect(isGuestAllowedToReadSpy).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      expect(res.sendStatus).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/login');
      expect(result).toBe('redirect');
      expect(req.session.jumpTo).toBe('original url 1');
    });

  });

});
