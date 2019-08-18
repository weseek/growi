import each from 'jest-each';

require('module-alias/register');

const TagCacheManager = require('@src/plugin/service/tag-cache-manager');

describe('TagCacheManager', () => {

  test('.constructor throws Exception when \'cacheNs\' is null', () => {
    const generateCacheKeyMock = jest.fn();

    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager(null, generateCacheKeyMock);
    }).toThrowError(/cacheNs/);
  });

  test('.constructor throws Exception when \'generateCacheKey\' is null', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager('dummy ns', null);
    }).toThrowError(/generateCacheKey/);
  });

  test('.constructor throws Exception when \'generateCacheKey\' is not function', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager('dummy ns', {});
    }).toThrowError(/generateCacheKey/);
  });

  test('.constructor set params', () => {
    const generateCacheKeyMock = jest.fn();

    const instance = new TagCacheManager('dummy ns', generateCacheKeyMock);
    expect(instance).not.toBeNull();
    expect(instance.cacheNs).toBe('dummy ns');
    expect(instance.generateCacheKey).toBe(generateCacheKeyMock);
  });

});
