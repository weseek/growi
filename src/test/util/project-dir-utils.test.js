import path from 'path';
import { projectRoot, resolveFromRoot } from '~/utils/project-dir-utils';

jest.mock('fs');
// TODO: Make mock changes for each test.
jest.mock('process', () => {
  return {
    cwd: jest.fn().mockImplementation(() => {
      return 'cwd';
    }),
  };
});

// TODO: Make mock changes for each test.
jest.mock('fs', () => {
  return {
    existsSync: jest.fn().mockImplementation(() => {
      return true;
    }),
  };
});

describe('.resolveFromRoot', () => {
  test('should intended return path when isServr true and fs.existsSync true', () => {
    const result = resolveFromRoot('relativePath');
    expect(result).toBe(`${path.resolve()}/cwd/relativePath`);
  });
});
// TODO: Add test of when isServer false and fs.existsSync false
