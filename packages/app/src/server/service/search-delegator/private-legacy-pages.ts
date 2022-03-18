import mongoose from 'mongoose';

import { PageModel, PageDocument } from '~/server/models/page';
import { SearchDelegatorName } from '~/interfaces/named-query';
import { IPage } from '~/interfaces/page';
import {
  SearchableData, SearchDelegator,
} from '../../interfaces/search';
import { serializeUserSecurely } from '../../models/serializers/user-serializer';
import { ISearchResult } from '~/interfaces/search';


class PrivateLegacyPagesDelegator implements SearchDelegator<IPage> {

  name!: SearchDelegatorName.PRIVATE_LEGACY_PAGES

  constructor() {
    this.name = SearchDelegatorName.PRIVATE_LEGACY_PAGES;
  }

  async search(_data: SearchableData | null, user, userGroups, option): Promise<ISearchResult<IPage>> {
    const { offset, limit } = option;

    if (offset == null || limit == null) {
      throw Error('PrivateLegacyPagesDelegator requires pagination options (offset, limit).');
    }
    if (user == null && userGroups == null) {
      throw Error('Either of user and userGroups must not be null.');
    }

    // find private legacy pages
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    const countQueryBuilder = new PageQueryBuilder(Page.find());
    await countQueryBuilder.addConditionAsMigratablePages(user);
    const findQueryBuilder = new PageQueryBuilder(Page.find());
    await findQueryBuilder.addConditionAsMigratablePages(user);

    const total = await countQueryBuilder.query.count();

    const _pages: PageDocument[] = await findQueryBuilder
      .addConditionToPagenate(offset, limit)
      .query
      .populate('lastUpdateUser')
      .exec();

    const pages = _pages.map((page) => {
      page.lastUpdateUser = serializeUserSecurely(page.lastUpdateUser);
      return page;
    });

    return {
      data: pages,
      meta: {
        total,
        hitsCount: pages.length,
      },
    };
  }

}

export default PrivateLegacyPagesDelegator;
