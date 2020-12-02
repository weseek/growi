import { hasProcessFlag } from '~/utils/process-utils';

jest.mock('process');

describe('.hasProcessFlag', () => {
  beforeAll(async() => {
    // see: https://github.com/facebook/jest/issues/5089#issuecomment-392827082
    process.argv.push('hoge', 'fuga');
  });
  test('should be return true has flag', () => {
    expect(hasProcessFlag('hoge')).toBeTruthy();
  });
  test('should be return false has not flag', () => {
    expect(hasProcessFlag('piyo')).toBeFalsy();
  });
});
