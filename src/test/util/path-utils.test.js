const { isTopPage } = require('../../lib/util/path-utils');


describe('TopPage Path test', () => {
  test('Path is only "/"', () => {
    const result = isTopPage('/');
    expect(result).toBe(true);
  });
  test('Path is not match string ', () => {
    const result = isTopPage('/test');
    expect(result).toBe(false);
  });
  test('Path is integer', () => {
    const result = isTopPage(1);
    expect(result).toBe(false);
  });
  test('Path is null', () => {
    const result = isTopPage(null);
    expect(result).toBe(false);
  });
});
