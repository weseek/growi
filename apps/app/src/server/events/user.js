const debug = require('debug')('growi:events:user');

const util = require('util');
const events = require('events');

function UserEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(UserEvent, events.EventEmitter);

UserEvent.prototype.onActivated = async function(user) {
  const Page = this.crowi.model('Page');

  const userHomePagePath = Page.getUserHomePagePath(user);

  const page = await Page.findByPath(userHomePagePath, user);

  if (page == null) {
    const body = `# ${user.username}\nThis is ${user.username}'s page`;

    // create user page
    try {
      await this.crowi.pageService.create(userHomePagePath, body, user, {});

      // page created
      debug('User page created', page);
    }
    catch (err) {
      debug('Failed to create user page', err);
    }
  }
};

module.exports = UserEvent;
