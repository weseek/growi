import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:user');

const util = require('util');
const events = require('events');

function UserEvent(crowi) {
  this.crowi = crowi;

  events.EventEmitter.call(this);
}
util.inherits(UserEvent, events.EventEmitter);

UserEvent.prototype.onActivated = async function(user) {
  const Page = this.crowi.model('Page');

  const userPagePath = Page.getUserPagePath(user);

  const page = await Page.findByPath(userPagePath, user);

  if (page == null) {
    const body = `# ${user.username}\nThis is ${user.username}'s page`;

    // create user page
    try {
      await Page.create(userPagePath, body, user, {});

      // page created
      logger.debug('User page created', page);
    }
    catch (err) {
      logger.debug('Failed to create user page', err);
    }
  }
};

module.exports = UserEvent;
