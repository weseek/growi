import EventEmitter from 'events';

import type { IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import mongoose from 'mongoose';

import type { PageModel } from '~/server/models/page';
import loggerFactory from '~/utils/logger';

import PageService from '../service/page';

const logger = loggerFactory('growi:events:user');

class UserEvent extends EventEmitter {

  crowi: any;

  pageService: PageService | null;

  constructor(crowi: any) {
    super();
    this.crowi = crowi;
    this.pageService = this.crowi.pageService;
  }

  async onActivated(user: IUserHasId): Promise<void> {
    try {
      if (this.pageService === null) {
        throw new Error('crowi pageService is null');
      }

      const Page = mongoose.model('Page') as unknown as PageModel;
      const userHomepagePath = pagePathUtils.userHomepagePath(user);

      let page = await Page.findByPath(userHomepagePath, true);

      // TODO: Make it more type safe
      // Since the type of page.creator is 'any', we resort to the following comparison,
      // checking if page.creator.toString() is not equal to user._id.toString().
      // Our code covers null, string, or object types.
      if (page != null && page.creator != null && page.creator.toString() !== user._id.toString()) {
        await this.pageService.deleteCompletelyUserHomeBySystem(userHomepagePath);
        page = null;
      }

      if (page == null) {
        const body = `# ${user.username}\nThis is ${user.username}'s page`;
        await this.pageService.create(userHomepagePath, body, user, {});
        logger.debug('User page created', page);
      }
    }
    catch (err) {
      logger.error('Failed to create user page', err);
    }
  }

}

export default UserEvent;
