import each from 'jest-each';

require('module-alias/register');

const TagCacheManager = require('@src/plugin/service/tag-cache-manager');

describe('TagCacheManager', () => {

  test('.constructor set params', () => {
    const instance = new TagCacheManager('dummy ns', (tagContext) => {});
    expect(instance).not.toBeNull();
  });

});
