import each from 'jest-each';

require('module-alias/register');

const OptionParser = require('@src/plugin/util/option-parser');

describe('option-parser', () => {

  test('.parseRange(null) returns null', () => {
    expect(OptionParser.parseRange(null)).toBeNull();
  });

  each`
    arg
    ${'aaa'}
    ${'5++2'}
    ${'5:+2'}
  `.describe.only('.parseRange(\'$arg\')', ({ arg }) => {
    test('returns null', () => {
      expect(OptionParser.parseRange(arg)).toBeNull();
    });
  });

});
