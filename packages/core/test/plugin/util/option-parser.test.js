import each from 'jest-each';

import { OptionParser } from '~/plugin/util/option-parser';

describe('option-parser', () => {

  test('.parseRange(null) returns null', () => {
    expect(OptionParser.parseRange(null)).toBeNull();
  });

  each`
    arg
    ${'aaa'}
    ${'5++2'}
    ${'5:+2'}
  `.test('.parseRange(\'$arg\') returns null', ({ arg }) => {
    expect(OptionParser.parseRange(arg)).toBeNull();
  });

  each`
    arg       | start | end
    ${'1'}    | ${1} | ${1}
    ${'2:1'}  | ${2} | ${1}
    ${'2:'}   | ${2} | ${-1}
    ${'10:-3'}   | ${10} | ${-3}
    ${'5+2'}   | ${5} | ${7}
    ${'5+'}   | ${5} | ${5}
  `.test('.parseRange(\'$arg\') returns { start: $start, end : $end }', ({ arg, start, end }) => {
    expect(OptionParser.parseRange(arg)).toEqual({ start, end });
  });

});
