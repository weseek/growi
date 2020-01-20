const { getInstance } = require('../setup-crowi');

describe('Slack Util', () => {

  let crowi;
  let slack;

  beforeEach(async(done) => {
    crowi = await getInstance();
    slack = require(`${crowi.libDir}/util/slack`)(crowi);
    done();
  });

  test('post comment method exists', () => {
    expect(slack.postComment).toBeInstanceOf(Function);
  });

  test('post page method exists', () => {
    expect(slack.postPage).toBeInstanceOf(Function);
  });
});
