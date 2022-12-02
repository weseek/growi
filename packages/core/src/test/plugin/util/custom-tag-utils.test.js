import rewire from 'rewire';

import * as customTagUtils from '~/plugin/util/custom-tag-utils';

// leave it commented out for rewire example -- 2022.08.18 Yuki Takei
// const rewiredCustomTagUtils = rewire('../../../plugin/util/custom-tag-utils');

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

  // leave it commented out for rewire example -- 2022.08.18 Yuki Takei
  // test('.createRandomStr(10) returns random string', () => {
  //   // get private resource
  //   const createRandomStr = rewiredCustomTagUtils.__get__('createRandomStr');
  //   expect(createRandomStr(10)).toMatch(/^[a-z0-9]{10}$/);
  // });

  // test('.findTagAndReplace() returns default object when tagPattern is null', () => {
  //   const htmlMock = jest.fn();
  //   htmlMock.replace = jest.fn();

  //   const result = customTagUtils.findTagAndReplace(null, '');

  //   expect(result).toEqual({ html: '', tagContextMap: {} });
  //   expect(htmlMock.replace).not.toHaveBeenCalled();
  // });

  // test('.findTagAndReplace() returns default object when html is null', () => {
  //   const tagPatternMock = jest.fn();
  //   tagPatternMock.source = jest.fn();

  //   const result = customTagUtils.findTagAndReplace(tagPatternMock, null);

  //   expect(result).toEqual({ html: null, tagContextMap: {} });
  //   expect(tagPatternMock.source).not.toHaveBeenCalled();
  // });

  // test('.findTagAndReplace() works correctly', () => {
  //   // setup mocks for private function
  //   rewiredCustomTagUtils.__set__('createRandomStr', (length) => {
  //     return 'dummyDomId';
  //   });

  //   const tagPattern = /ls|lsx/;
  //   const html = '<section><h1>header</h1>\n$ls(/)</section>';

  //   const result = rewiredCustomTagUtils.findTagAndReplace(tagPattern, html);

  //   expect(result.html).toMatch(/<section><h1>header<\/h1>\n<div id="ls-dummyDomId"><\/div>/);
  //   expect(result.tagContextMap).toEqual({
  //     'ls-dummyDomId': {
  //       tagExpression: '$ls(/)',
  //       method: 'ls',
  //       args: '/',
  //     },
  //   });
  // });


});
