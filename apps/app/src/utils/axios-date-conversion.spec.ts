import { convertDateStringsToDates } from './axios';

describe('convertDateStringsToDates', () => {

  // Test case 1: Basic conversion in a flat object
  test('should convert ISO date strings to Date objects in a flat object', () => {
    const dateString = '2023-01-15T10:00:00.000Z';
    const input = {
      id: 1,
      createdAt: dateString,
      name: 'Test Item',
    };
    const expected = {
      id: 1,
      createdAt: new Date(dateString),
      name: 'Test Item',
    };
    const result = convertDateStringsToDates(input);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toEqual(dateString);
    expect(result).toEqual(expected);
  });

  // Test case 2: Nested objects
  test('should recursively convert ISO date strings in nested objects', () => {
    const dateString1 = '2023-02-20T12:30:00.000Z';
    const dateString2 = '2023-03-01T08:00:00.000Z';
    const input = {
      data: {
        item1: {
          updatedAt: dateString1,
          value: 10,
        },
        item2: {
          nested: {
            deletedAt: dateString2,
            isActive: false,
          },
        },
      },
    };
    const expected = {
      data: {
        item1: {
          updatedAt: new Date(dateString1),
          value: 10,
        },
        item2: {
          nested: {
            deletedAt: new Date(dateString2),
            isActive: false,
          },
        },
      },
    };
    const result = convertDateStringsToDates(input);
    expect(result.data.item1.updatedAt).toBeInstanceOf(Date);
    expect(result.data.item1.updatedAt.toISOString()).toEqual(dateString1);
    expect(result.data.item2.nested.deletedAt).toBeInstanceOf(Date);
    expect(result.data.item2.nested.deletedAt.toISOString()).toEqual(dateString2);
    expect(result).toEqual(expected);
  });

  // Test case 3: Arrays of objects
  test('should recursively convert ISO date strings in arrays of objects', () => {
    const dateString1 = '2023-04-05T14:15:00.000Z';
    const dateString2 = '2023-05-10T16:00:00.000Z';
    const input = [
      { id: 1, eventDate: dateString1 },
      { id: 2, eventDate: dateString2, data: { nestedProp: 'value' } },
    ];
    const expected = [
      { id: 1, eventDate: new Date(dateString1) },
      { id: 2, eventDate: new Date(dateString2), data: { nestedProp: 'value' } },
    ];
    const result = convertDateStringsToDates(input);
    expect(result[0].eventDate).toBeInstanceOf(Date);
    expect(result[0].eventDate.toISOString()).toEqual(dateString1);
    expect(result[1].eventDate).toBeInstanceOf(Date);
    expect(result[1].eventDate.toISOString()).toEqual(dateString2);
    expect(result).toEqual(expected);
  });

  // Test case 4: Array containing date strings directly (though less common for this function)
  test('should handle arrays containing date strings directly', () => {
    const dateString = '2023-06-20T18:00:00.000Z';
    const input = ['text', dateString, 123];
    const expected = ['text', new Date(dateString), 123];
    const result = convertDateStringsToDates(input);
    expect(result[1]).toBeInstanceOf(Date);
    expect(result[1].toISOString()).toEqual(dateString);
    expect(result).toEqual(expected);
  });

  // Test case 5: Data without date strings should remain unchanged
  test('should not modify data without ISO date strings', () => {
    const input = {
      name: 'Product A',
      price: 99.99,
      tags: ['electronic', 'sale'],
      description: 'Some text',
    };
    const originalInput = JSON.parse(JSON.stringify(input)); // Deep copy to ensure no mutation
    const result = convertDateStringsToDates(input);
    expect(result).toEqual(originalInput); // Should be deeply equal
    expect(result).toBe(input); // Confirm it mutated the original object
  });

  // Test case 6: Null, undefined, and primitive values
  test('should return primitive values as is', () => {
    expect(convertDateStringsToDates(null)).toBeNull();
    expect(convertDateStringsToDates(undefined)).toBeUndefined();
    expect(convertDateStringsToDates(123)).toBe(123);
    expect(convertDateStringsToDates('hello')).toBe('hello');
    expect(convertDateStringsToDates(true)).toBe(true);
  });

  // Test case 7: Edge case - empty objects/arrays
  test('should handle empty objects and arrays correctly', () => {
    const emptyObject = {};
    const emptyArray = [];
    expect(convertDateStringsToDates(emptyObject)).toEqual({});
    expect(convertDateStringsToDates(emptyArray)).toEqual([]);
    expect(convertDateStringsToDates(emptyObject)).toBe(emptyObject);
    expect(convertDateStringsToDates(emptyArray)).toEqual(emptyArray);
  });

  // Test case 8: Date string with different milliseconds (isoDateRegex without .000)
  test('should handle date strings with varied milliseconds', () => {
    const dateString = '2023-01-15T10:00:00Z'; // No milliseconds
    const input = { createdAt: dateString };
    const expected = { createdAt: new Date(dateString) };
    const result = convertDateStringsToDates(input);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.createdAt.toISOString()).toEqual('2023-01-15T10:00:00.000Z');
    expect(result).toEqual(expected);
  });

  // Test case 9: Object with null properties
  test('should handle objects with null properties', () => {
    const dateString = '2023-07-01T00:00:00.000Z';
    const input = {
      prop1: dateString,
      prop2: null,
      prop3: {
        nestedNull: null,
        nestedDate: dateString,
      },
    };
    const expected = {
      prop1: new Date(dateString),
      prop2: null,
      prop3: {
        nestedNull: null,
        nestedDate: new Date(dateString),
      },
    };
    const result = convertDateStringsToDates(input);
    expect(result.prop1).toBeInstanceOf(Date);
    expect(result.prop3.nestedDate).toBeInstanceOf(Date);
    expect(result).toEqual(expected);
  });

});
