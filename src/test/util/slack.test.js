var chai = require('chai')
  , expect = chai.expect
  , sinon = require('sinon')
  , sinonChai = require('sinon-chai')
  , utils = require('../utils.js')
  ;
chai.use(sinonChai);

describe('Slack Util', function () {
  var crowi = new (require(ROOT_DIR + '/src/server/crowi'))(ROOT_DIR, process.env);
  var slack = require(crowi.libDir + '/util/slack')(crowi);

  it('post comment method exists', function() {
    expect(slack).to.respondTo('postComment');
  });

  it('post page method exists', function() {
    expect(slack).to.respondTo('postPage');
  });
});
