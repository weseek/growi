import EventEmitter from 'events';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:events:user');

class UserEvent extends EventEmitter {

  constructor(crowi) {
    super();
    this.crowi = crowi;
  }

  async onActivated(user) {
    const Page = this.crowi.model('Page');
    const userHomepagePath = `/user/${user.username}`;
    let page = await Page.findByPath(userHomepagePath, user);

    if (page !== null && page.creator.toString() !== user._id.toString()) {
      await this.crowi.pageService.deleteCompletelyUserHomepageAndSubpages(user, userHomepagePath);
      page = null;
    }

    if (page == null) {
      const body = `# ${user.username}\nThis is ${user.username}'s page`;

      try {
        await this.crowi.pageService.create(userHomepagePath, body, user, {});
        logger.debug('User page created', page);
      }
      catch (err) {
        logger.error('Failed to create user page', err);
      }
    }
  }

}

module.exports = UserEvent;
