const toArrayFromCsv = require('../../lib/util/toArrayFromCsv');

describe('Slack Util', () => {

  test('post comment method exists', () => {
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
