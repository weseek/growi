const { getInstance } = require('../setup-crowi');
import setupSlackLegacy from '~/server/util/slack-legacy';


describe('Slack Util', () => {

  let crowi;
  let slackLegacy;

  beforeEach(async(done) => {
    crowi = await getInstance();
    slackLegacy = setupSlackLegacy(crowi);
    done();
  });

  test('post comment method exists', () => {
    expect(slackLegacy.postComment).toBeInstanceOf(Function);
  });

  test('post page method exists', () => {
    expect(slackLegacy.postPage).toBeInstanceOf(Function);
  });
});
