const chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('Slack Util', function () {
  const helpers = require('@commons/util/helpers');
  const Crowi = require('@server/crowi');
  const crowi = new Crowi(helpers.root(), process.env);
  const slack = require(crowi.libDir + '/util/slack')(crowi);

  it('post comment method exists', function() {
    expect(slack).to.respondTo('postComment');
  });

  it('post page method exists', function() {
    expect(slack).to.respondTo('postPage');
  });
});
