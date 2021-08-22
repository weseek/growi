const { getInstance } = require('../setup-crowi');

describe('Slack Util', () => {

  let crowi;
  let slackLegacyUtil;

  beforeEach(async() => {
    crowi = await getInstance();
    slackLegacyUtil = require('~/server/util/slack-legacy')(crowi);
  });

  test('postMessage method exists', () => {
    expect(slackLegacyUtil.postMessage).toBeInstanceOf(Function);
  });

});
