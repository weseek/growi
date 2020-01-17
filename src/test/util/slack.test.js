const helpers = require('@commons/util/helpers');

const Crowi = require('@server/crowi');

describe('Slack Util', () => {
  const crowi = new Crowi(helpers.root());
  const slack = require(`${crowi.libDir}/util/slack`)(crowi);

  test('post comment method exists', () => {
    expect(slack.postComment).toBeInstanceOf(Function);
  });

  test('post page method exists', () => {
    expect(slack.postPage).toBeInstanceOf(Function);
  });
});
