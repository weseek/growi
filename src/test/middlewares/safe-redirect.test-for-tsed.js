import { PlatformTest } from '@tsed/common';
import { SafeRedirectMiddleware } from '~/server/middlewares/safe-redirect';

describe('SafeRedirectMiddleware', () => {

  beforeEach(PlatformTest.create);
  afterEach(PlatformTest.reset);

  describe('res.safeRedirect', () => {
    // setup whitelist
    SafeRedirectMiddleware.setWhitelistOfHosts([
      'white1.example.com:8080',
      'white2.example.com',
    ]);

    // setup req/res/next
    const req = {
      protocol: 'http',
      hostname: 'example.com',
      get: jest.fn().mockReturnValue('example.com'),
    };
    const res = {
      redirect: jest.fn().mockReturnValue('redirect'),
    };
    const next = jest.fn();

    test('redirects to \'/\' because specified url causes open redirect vulnerability', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('//evil.example.com');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(result).toBe('redirect');
    });

    test('redirects to \'/\' because specified host without port is not in whitelist', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('http://white1.example.com/path/to/page');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('/');
      expect(result).toBe('redirect');
    });

    test('redirects to the specified local url', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('/path/to/page');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('http://example.com/path/to/page');
      expect(result).toBe('redirect');
    });

    test('redirects to the specified local url (fqdn)', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('http://example.com/path/to/page');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('http://example.com/path/to/page');
      expect(result).toBe('redirect');
    });

    test('redirects to the specified whitelisted url (white1.example.com:8080)', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('http://white1.example.com:8080/path/to/page');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('http://white1.example.com:8080/path/to/page');
      expect(result).toBe('redirect');
    });

    test('redirects to the specified whitelisted url (white2.example.com:8080)', () => {
      const middleware = PlatformTest.get(SafeRedirectMiddleware);

      middleware.use(req, res, next);

      const result = res.safeRedirect('http://white2.example.com:8080/path/to/page');

      expect(next).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledTimes(1);
      expect(req.get).toHaveBeenCalledWith('host');
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith('http://white2.example.com:8080/path/to/page');
      expect(result).toBe('redirect');
    });

  });

});
