import EventEmitter from 'events';

import type { IUserHasId } from '@growi/core';

import loggerFactory from '~/utils/logger';

import Crowi from '../crowi';

const logger = loggerFactory('growi:events:user');

class UserEvent extends EventEmitter {

  crowi: Crowi;

  constructor(crowi: Crowi) {
    super();
    this.crowi = crowi;
  }

  async onActivated(user: IUserHasId): Promise<void> {
    const Page = this.crowi.model('Page');
    const userHomePagePath = `/user/${user.username}`;
    let page = await Page.findByPath(userHomePagePath, user);

    if (page !== null && page.creator.toString() !== user._id.toString()) {
      await this.crowi.pageService?.deleteCompletelyUserHomeBySystem(user, userHomePagePath);
      page = null;
    }

    if (page == null) {
      const body = `# ${user.username}\nThis is ${user.username}'s page`;

      try {
        await this.crowi.pageService?.create(userHomePagePath, body, user, {});
        logger.debug('User page created', page);
      }
      catch (err) {
        logger.error('Failed to create user page', err);
      }
    }
  }

}

export default UserEvent;
