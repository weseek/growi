import * as pathUtils from '~/utils/path-utils';


describe('page-utils', () => {
  describe('.normalizePath', () => {
    test('should return the root path with empty string', () => {
      expect(pathUtils.normalizePath('')).toBe('/');
    });

    test('should return the root path as is', () => {
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
