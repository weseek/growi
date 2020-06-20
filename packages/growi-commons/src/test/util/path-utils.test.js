require('module-alias/register');

const pathUtils = require('@src/util/path-utils');


describe('page-utils', () => {
  describe('.normalizePath', () => {
    test('should return root path with empty string', () => {
      expect(pathUtils.normalizePath('')).toBe('/');
    });

    test('should return the root page as is', () => {
      expect(pathUtils.normalizePath('/')).toBe('/');
    });

    test('should add heading slash', () => {
      expect(pathUtils.normalizePath('hoge/fuga')).toBe('/hoge/fuga');
    });

    test('should remove trailing slash', () => {
      expect(pathUtils.normalizePath('/hoge/fuga/')).toBe('/hoge/fuga');
    });

    test('should remove unnecessary slashes', () => {
      expect(pathUtils.normalizePath('//hoge/fuga//')).toBe('/hoge/fuga');
    });
  });
});
