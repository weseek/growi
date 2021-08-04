const { getInstance } = require('../setup-crowi');

describe('Slack Util', () => {

  let crowi;
  let slackLegacy;

  beforeEach(async() => {
    crowi = await getInstance();
    slackLegacy = require('~/server/util/slack-legacy')(crowi);
  });

  test('post comment method exists', () => {
    expect(slackLegacy.postComment).toBeInstanceOf(Function);
  });

  test('post page method exists', () => {
    expect(slackLegacy.postPage).toBeInstanceOf(Function);
  });
});
