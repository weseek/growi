import path from 'path';
import { projectRoot, resolveFromRoot } from '~/utils/project-dir-utils';

jest.mock('path');
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
  beforeAll(() => {
    path.resolve.mockImplementation(jest.fn());
  });
  test('should intended functions coll when ', () => {
    resolveFromRoot('relativePath');
    expect(path.resolve.mock.calls[0]).toMatchObject(['cwd', 'relativePath']);
  });
});
// TODO: Add test of when isServer false and fs.existsSync false
