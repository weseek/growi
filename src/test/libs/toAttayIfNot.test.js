const toArrayFromCsv = require('@commons/util/to-array-from-csv');

describe('Slack Util', () => {

  test('post', () => {
    const result = toArrayFromCsv('dev,general');
    expect(result).toStrictEqual(['dev', 'general']);
  });

  test('post 2', () => {
    const result = toArrayFromCsv('dev');
    expect(result).toStrictEqual(['dev']);
  });

  test('post 3', () => {
    const result = toArrayFromCsv('');
    expect(result).toStrictEqual(['']);
  });

});
