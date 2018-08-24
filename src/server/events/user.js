var debug = require('debug')('growi:events:user');
var util = require('util');
var events = require('events');

function UserEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(UserEvent, events.EventEmitter);

UserEvent.prototype.onActivated = function(user) {
  var User = this.crowi.model('User');
  var Page = this.crowi.model('Page');

  var userPagePath = Page.getUserPagePath(user);
  Page.findPage(userPagePath, user, {}, false)
  .then(function(page) {
    // do nothing because user page is already exists.
  }).catch(function(err) {
    var body = `# ${user.username}\nThis is ${user.username}\'s page`;
    // create user page
    Page.create(userPagePath, body, user, {})
    .then(function(page) {
      // page created
      debug('User page created', page);
    }).catch(function(err) {
      debug('Failed to create user page', err);
    });
  });
};

module.exports = UserEvent;
