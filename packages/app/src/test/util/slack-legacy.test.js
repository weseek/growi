const { getInstance } = require('../setup-crowi');

describe('Slack Util', () => {

  let crowi;
  let slackLegacy;

  beforeEach(async(done) => {
    crowi = await getInstance();
    slackLegacy = require(`${crowi.libDir}/util/slack-legacy`)(crowi);
    done();
  });

  test('post comment method exists', () => {
    expect(slackLegacy.postComment).toBeInstanceOf(Function);
  });

  test('post page method exists', () => {
    expect(slackLegacy.postPage).toBeInstanceOf(Function);
  });
});
