require('module-alias/register');

const customTagUtils = require('@src/plugin/util/custom-tag-utils');

describe('customTagUtils', () => {

  test('exports TagContext', () => {
    expect(customTagUtils.TagContext).not.toBeNull();
    expect(typeof customTagUtils.TagContext).toBe('function');
  });

  test('exports ArgsParser', () => {
    expect(customTagUtils.ArgsParser).not.toBeNull();
    expect(typeof customTagUtils.ArgsParser).toBe('function');
  });

  test('exports OptionParser', () => {
    expect(customTagUtils.OptionParser).not.toBeNull();
    expect(typeof customTagUtils.OptionParser).toBe('function');
  });

  test('.createRandomStr(10) returns random string', () => {
    // get private resource
    const createRandomStr = customTagUtils.__get__('createRandomStr');
    expect(createRandomStr(10)).toMatch(/^[a-z0-9]{10}$/);
  });

});
