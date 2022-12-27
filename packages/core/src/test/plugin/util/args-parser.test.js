import { ArgsParser } from '~/plugin/util/args-parser';

describe('args-parser', () => {

  test('.parse(null) returns default object', () => {
    const result = ArgsParser.parse(null);

    expect(result.firstArgsKey).toBeNull();
    expect(result.firstArgsValue).toBeNull();
    expect(result.options).toEqual({});
  });

  test('.parse(\'prefix=/Level1\') returns a valid results', () => {
    const result = ArgsParser.parse('prefix=/Level1');

    expect(result.firstArgsKey).toBe('prefix');
    expect(result.firstArgsValue).toBe('/Level1');
  });

  test('.parse(\'key, opt1=1, opt2=2\') returns a valid results', () => {
    const result = ArgsParser.parse('key, opt1=1, opt2=2');

    expect(result.firstArgsKey).toBe('key');
    expect(result.firstArgsValue).toBeTruthy();

    expect(Object.keys(result.options).length).toBe(3);
    expect(result.options.key).toBeTruthy();
    expect(result.options.opt1).toBe('1');
    expect(result.options.opt2).toBe('2');
  });

  test('.parse(\'key, \') returns a valid results', () => {
    const result = ArgsParser.parse('key, ');

    expect(result.firstArgsKey).toBe('key');
    expect(result.firstArgsValue).toBeTruthy();

    expect(Object.keys(result.options).length).toBe(1);
    expect(result.options.key).toBeTruthy();
  });

});
