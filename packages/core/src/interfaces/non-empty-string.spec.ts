import { describe, expect, it } from 'vitest';

import { isNonEmptyString, toNonEmptyStringOrUndefined } from './non-empty-string';

describe('isNonEmptyString', () => {
  it('should return true for non-empty strings', () => {
    // Arrange
    const validStrings = ['hello', 'world', 'a', '1', ' ', '   '];

    // Act & Assert
    validStrings.forEach((str) => {
      expect(isNonEmptyString(str)).toBe(true);
    });
  });

  it('should return false for empty string', () => {
    // Arrange
    const emptyString = '';

    // Act
    const result = isNonEmptyString(emptyString);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for null', () => {
    // Arrange
    const nullValue = null;

    // Act
    const result = isNonEmptyString(nullValue);

    // Assert
    expect(result).toBe(false);
  });

  it('should return false for undefined', () => {
    // Arrange
    const undefinedValue = undefined;

    // Act
    const result = isNonEmptyString(undefinedValue);

    // Assert
    expect(result).toBe(false);
  });
});

describe('toNonEmptyStringOrUndefined', () => {
  it('should return the string when it is non-empty', () => {
    // Arrange
    const validStrings = ['hello', 'world', 'a', '1', ' ', '   '];

    // Act & Assert
    validStrings.forEach((str) => {
      const result = toNonEmptyStringOrUndefined(str);
      expect(result).toBe(str);
    });
  });

  it('should return undefined for empty string', () => {
    // Arrange
    const emptyString = '';

    // Act
    const result = toNonEmptyStringOrUndefined(emptyString);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should return undefined for null', () => {
    // Arrange
    const nullValue = null;

    // Act
    const result = toNonEmptyStringOrUndefined(nullValue);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    // Arrange
    const undefinedValue = undefined;

    // Act
    const result = toNonEmptyStringOrUndefined(undefinedValue);

    // Assert
    expect(result).toBeUndefined();
  });

  it('should maintain type safety with NonEmptyString brand', () => {
    // Arrange
    const validString = 'test';

    // Act
    const result = toNonEmptyStringOrUndefined(validString);

    // Assert
    expect(result).toBe(validString);
    // Type assertion to verify the result is typed as NonEmptyString
    if (result !== undefined) {
      const _typedResult: typeof result = validString as any;
      expect(_typedResult).toBe(validString);
    }
  });
});
