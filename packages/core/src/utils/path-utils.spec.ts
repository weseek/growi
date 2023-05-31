import * as pathUtils from './path-utils';


describe('page-utils', () => {
  describe('.normalizePath', () => {
    test.concurrent('should return the root path with empty string', () => {
      expect(pathUtils.normalizePath('')).toBe('/');
    });

    test.concurrent('should return the root path as is', () => {
      expect(pathUtils.normalizePath('/')).toBe('/');
    });

    test.concurrent('should add heading slash', () => {
      expect(pathUtils.normalizePath('hoge/fuga')).toBe('/hoge/fuga');
    });

    test.concurrent('should remove trailing slash', () => {
      expect(pathUtils.normalizePath('/hoge/fuga/')).toBe('/hoge/fuga');
    });

    test.concurrent('should remove unnecessary slashes', () => {
      expect(pathUtils.normalizePath('//hoge/fuga//')).toBe('/hoge/fuga');
    });
  });
});
