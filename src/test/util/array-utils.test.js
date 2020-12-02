import { toArrayIfNot } from '~/utils/array-utils';

describe('.toArrayIfNot', () => {
  test('should be return arg array', () => {
    expect(toArrayIfNot([])).toMatchObject([]);
    expect(toArrayIfNot([1, 2])).toMatchObject([1, 2]);
    expect(toArrayIfNot(['hoge', 2, true])).toMatchObject(['hoge', 2, true]);
  });
  test('should be return empty array', () => {
    expect(toArrayIfNot(null)).toMatchObject([]);
    expect(toArrayIfNot(undefined)).toMatchObject([]);
  });
  test('should be return wrap array arg', () => {
    expect(toArrayIfNot('hoge')).toMatchObject(['hoge']);
    expect(toArrayIfNot(1)).toMatchObject([1]);
    expect(toArrayIfNot(false)).toMatchObject([false]);
    expect(toArrayIfNot({})).toMatchObject({});
  });
});
