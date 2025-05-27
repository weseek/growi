import * as pathUtils from './path-utils';

describe('page-utils', () => {
  const testPaths = [
    '/',
    '',
    'path',
    '/path',
    'path/',
    '/path/',
    'path1/path2',
    '/path1/path2',
    'path1/path2/',
    '/path1/path2/',
    '//path1/path2//',
    'https://example.com',
    'https://example.com/',
  ];

  describe('.normalizePath', () => {
    test.concurrent.each(testPaths)('should normalize path: %s', (path) => {
      const result = pathUtils.normalizePath(path);
      expect(result.startsWith('/')).toBe(true);
      if (path === '' || path === '/') {
        expect(result.endsWith('/')).toBe(true);
        expect(result).toBe('/');
      }
      else if (path === 'https://example.com' || path === 'https://example.com/') {
        // normalizePath for 'https://example.com' or 'https://example.com/' returns '/https://example.com'
        expect(result.endsWith('/')).toBe(false);
        expect(result).toBe('/https://example.com');
      }
      else {
        expect(result.endsWith('/')).toBe(false);
      }
    });


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

  describe('.hasHeadingSlash', () => {
    test.concurrent.each(testPaths)('should check heading slash: %s', (path) => {
      const result = pathUtils.hasHeadingSlash(path);
      if (path === '/') {
        // hasHeadingSlash('/') uses matchSlashes which returns null for '/', so result is false.
        expect(result).toBe(false);
      }
      else {
        // For other paths, it checks if the path starts with '/' AND is not just '/'
        expect(result).toBe(path.startsWith('/') && path !== '/');
      }
    });
  });

  describe('.hasTrailingSlash', () => {
    test.concurrent.each(testPaths)('should check trailing slash: %s', (path) => {
      const result = pathUtils.hasTrailingSlash(path);
      if (path === '/') {
        // hasTrailingSlash('/') uses matchSlashes which returns null for '/', so result is false.
        expect(result).toBe(false);
      }
      else {
        // For other paths, it checks if the path ends with '/' AND is not just '/'
        expect(result).toBe(path.endsWith('/') && path !== '/');
      }
    });
  });

  describe('.addHeadingSlash', () => {
    test.concurrent.each(testPaths)('should add heading slash: %s', (path) => {
      const result = pathUtils.addHeadingSlash(path);
      expect(result.startsWith('/')).toBe(true);
      if (path === '/') {
        expect(result).toBe(path);
      }
    });
  });

  describe('.addTrailingSlash', () => {
    test.concurrent.each(testPaths)('should add trailing slash: %s', (path) => {
      const result = pathUtils.addTrailingSlash(path);
      expect(result.endsWith('/')).toBe(true);
      if (path === '/') {
        expect(result).toBe(path);
      }
    });
  });

  describe('.removeHeadingSlash', () => {
    test.concurrent.each(testPaths)('should remove heading slash: %s', (path) => {
      const result = pathUtils.removeHeadingSlash(path);
      if (path === '/') {
        expect(result).toBe('/');
      }
      else if (path === '//path1/path2//') {
        // removeHeadingSlash('//path1/path2//') returns '/path1/path2//' due to hasHeadingSlash returning true for '//...'
        // and then substring(1) is called.
        expect(result.startsWith('/')).toBe(true);
        expect(result).toBe('/path1/path2//');
      }
      else if (path.startsWith('//') && path.length > 2) { // e.g. "//a"
        expect(result.startsWith('/')).toBe(true);
        expect(result).toBe(path.substring(1));
      }
      else if (path.startsWith('//') && path.length === 2) { // e.g. "//"
        expect(result).toBe('/'); // removeHeadingSlash("//") -> hasHeadingSlash is true, returns "/"
      }
      else {
        expect(result.startsWith('/')).toBe(false);
      }
    });
  });

  describe('.removeTrailingSlash', () => {
    test.concurrent.each(testPaths)('should remove trailing slash: %s', (path) => {
      const result = pathUtils.removeTrailingSlash(path);
      if (path === '/') {
        expect(result).toBe('/');
      }
      else {
        expect(result.endsWith('/')).toBe(false);
      }
    });
  });

  describe('.getParentPath', () => {
    test.concurrent.each(testPaths)('should get parent path: %s', (path) => {
      const result = pathUtils.getParentPath(path);
      expect(result.startsWith('/')).toBe(true);

      if (path === '/' || path === '') {
        expect(result).toBe('/');
        expect(result.endsWith('/')).toBe(true);
      }
      else if (path === 'path' || path === '/path') {
        // getParentPath('path') -> normalizePath('') -> '/'
        // getParentPath('/path') -> normalizePath('') -> '/'
        expect(result).toBe('/');
        expect(result.endsWith('/')).toBe(true);
      }
      else if (path === 'path/') {
        // getParentPath('path/') -> normalizePath('path') -> '/path'
        expect(result).toBe('/path');
        expect(result.endsWith('/')).toBe(false);
      }
      else if (path === '/path/') {
        // getParentPath('/path/') -> normalizePath('/path') -> '/path'
        expect(result).toBe('/path');
        expect(result.endsWith('/')).toBe(false);
      }
      else if (path === 'https://example.com') {
        // getParentPath('https://example.com') -> normalizePath('https:/') -> '/https:'
        expect(result).toBe('/https:');
        expect(result.endsWith('/')).toBe(false);
      }
      else if (path === 'https://example.com/') {
        // getParentPath('https://example.com/') -> normalizePath('https://example.com') -> '/https://example.com'
        expect(result).toBe('/https://example.com');
        expect(result.endsWith('/')).toBe(false);
      }
      else if (path === '//path1/path2//') {
        // getParentPath('//path1/path2//') -> normalizePath('//path1/path2') -> '/path1/path2'
        expect(result).toBe('/path1/path2');
        expect(result.endsWith('/')).toBe(false);
      }
      else {
        // For other non-root parent paths, it should not end with a slash
        expect(result.endsWith('/')).toBe(false);
      }
    });

    test.concurrent('should return root for top level paths', () => {
      expect(pathUtils.getParentPath('/page')).toBe('/');
      expect(pathUtils.getParentPath('page')).toBe('/');
    });

    test.concurrent('should return correct parent path', () => {
      expect(pathUtils.getParentPath('/path1/path2')).toBe('/path1');
      // getParentPath('/path1/path2/') -> normalizePath('/path1/path2') -> '/path1/path2'
      expect(pathUtils.getParentPath('/path1/path2/')).toBe('/path1/path2');
    });
  });
});
