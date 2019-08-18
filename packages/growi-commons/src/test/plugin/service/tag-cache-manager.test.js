// import each from 'jest-each';

require('module-alias/register');

jest.mock('@src/service/localstorage-manager');

const LocalStorageManager = require('@src/service/localstorage-manager');
const TagCacheManager = require('@src/plugin/service/tag-cache-manager');


describe('TagCacheManager.constructor', () => {

  test('throws Exception when \'cacheNs\' is null', () => {
    const generateCacheKeyMock = jest.fn();

    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager(null, generateCacheKeyMock);
    }).toThrowError(/cacheNs/);
  });

  test('throws Exception when \'generateCacheKey\' is null', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager('dummy ns', null);
    }).toThrowError(/generateCacheKey/);
  });

  test('throws Exception when \'generateCacheKey\' is not function', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new TagCacheManager('dummy ns', {});
    }).toThrowError(/generateCacheKey/);
  });

  test('set params', () => {
    const generateCacheKeyMock = jest.fn();

    const instance = new TagCacheManager('dummy ns', generateCacheKeyMock);
    expect(instance).not.toBeNull();
    expect(instance.cacheNs).toBe('dummy ns');
    expect(instance.generateCacheKey).toBe(generateCacheKeyMock);
  });

});

describe('TagCacheManager', () => {

  let generateCacheKeyMock = null;
  let localStorageManagerMock = null;

  let tagCacheManager = null;


  beforeEach(() => {
    generateCacheKeyMock = jest.fn();
    localStorageManagerMock = jest.fn();

    // mock for LocalStorageManager.getInstance
    LocalStorageManager.getInstance = jest.fn();
    LocalStorageManager.getInstance.mockReturnValue(localStorageManagerMock);

    tagCacheManager = new TagCacheManager('dummy ns', generateCacheKeyMock);
  });

  test('.getStateCache', () => {
    // partial mock
    tagCacheManager.generateCacheKey = jest.fn().mockReturnValue('dummy key');

    // mock for LocalStorageManager
    const stateCacheMock = jest.fn();
    localStorageManagerMock.retrieveFromSessionStorage = jest.fn();
    localStorageManagerMock.retrieveFromSessionStorage
      .mockReturnValue(stateCacheMock);

    const tagContextMock = jest.fn();

    // when
    const result = tagCacheManager.getStateCache(tagContextMock);
    // then
    expect(result).not.toBeNull();
    expect(result).toBe(stateCacheMock);
    const generateCacheKeyMockCalls = tagCacheManager.generateCacheKey.mock.calls;
    expect(generateCacheKeyMockCalls.length).toBe(1);
    expect(generateCacheKeyMockCalls[0][0]).toBe(tagContextMock);
    const retrieveFromSessionStorageMockCalls = localStorageManagerMock.retrieveFromSessionStorage.mock.calls;
    expect(retrieveFromSessionStorageMockCalls.length).toBe(1);
    expect(retrieveFromSessionStorageMockCalls[0][0]).toBe('dummy ns');
    expect(retrieveFromSessionStorageMockCalls[0][1]).toBe('dummy key');
  });
});
