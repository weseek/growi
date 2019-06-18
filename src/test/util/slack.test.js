const chai = require('chai');
const sinonChai = require('sinon-chai');

const expect = chai.expect;

chai.use(sinonChai);

describe('Slack Util', () => {
  const helpers = require('@commons/util/helpers');
  const Crowi = require('@server/crowi');
  const crowi = new Crowi(helpers.root(), process.env);
  const slack = require(`${crowi.libDir}/util/slack`)(crowi);

  test('post comment method exists', () => {
    expect(slack).to.respondTo('postComment');
  });

  test('post page method exists', () => {
    expect(slack).to.respondTo('postPage');
  });
});
