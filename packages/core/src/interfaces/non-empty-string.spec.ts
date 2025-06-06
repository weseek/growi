import { describe, expect, it } from 'vitest';

import { isNonEmptyString, toNonEmptyStringOrUndefined } from './non-empty-string';

describe('isNonEmptyString', () => {
  /* eslint-disable indent */
  it.each`
    input         | expected      | description
    ${'hello'}    | ${true}       | ${'non-empty string'}
    ${'world'}    | ${true}       | ${'non-empty string'}
    ${'a'}        | ${true}       | ${'single character'}
    ${'1'}        | ${true}       | ${'numeric string'}
    ${' '}        | ${true}       | ${'space character'}
    ${'   '}      | ${true}       | ${'multiple spaces'}
    ${''}         | ${false}      | ${'empty string'}
    ${null}       | ${false}      | ${'null'}
    ${undefined}  | ${false}      | ${'undefined'}
  `('should return $expected for $description: $input', ({ input, expected }) => {
  /* eslint-enable indent */
    expect(isNonEmptyString(input)).toBe(expected);
  });
});

describe('toNonEmptyStringOrUndefined', () => {
  /* eslint-disable indent */
  it.each`
    input         | expected      | description
    ${'hello'}    | ${'hello'}    | ${'non-empty string'}
    ${'world'}    | ${'world'}    | ${'non-empty string'}
    ${'a'}        | ${'a'}        | ${'single character'}
    ${'1'}        | ${'1'}        | ${'numeric string'}
    ${' '}        | ${' '}        | ${'space character'}
    ${'   '}      | ${'   '}      | ${'multiple spaces'}
    ${''}         | ${undefined}  | ${'empty string'}
    ${null}       | ${undefined}  | ${'null'}
    ${undefined}  | ${undefined}  | ${'undefined'}
  `('should return $expected for $description: $input', ({ input, expected }) => {
  /* eslint-enable indent */
    expect(toNonEmptyStringOrUndefined(input)).toBe(expected);
  });
});

describe('toNonEmptyStringOrUndefined type safety', () => {
  it('should maintain type safety with NonEmptyString brand', () => {
    const validString = 'test';
    const result = toNonEmptyStringOrUndefined(validString);

    expect(result).toBe(validString);
    if (result !== undefined) {
      const _typedResult: typeof result = validString as typeof result;
      expect(_typedResult).toBe(validString);
    }
  });
});
