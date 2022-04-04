import mongoose from 'mongoose';

import { PageModel, PageDocument } from '~/server/models/page';
import { SearchDelegatorName } from '~/interfaces/named-query';
import { IPage } from '~/interfaces/page';
import {
  QueryTerms, MongoTermsKey,
  SearchableData, SearchDelegator, UnavailableTermsKey, MongoQueryTerms,
} from '../../interfaces/search';
import { serializeUserSecurely } from '../../models/serializers/user-serializer';
import { ISearchResult } from '~/interfaces/search';


class PrivateLegacyPagesDelegator implements SearchDelegator<IPage, MongoTermsKey, MongoQueryTerms> {

  name!: SearchDelegatorName.PRIVATE_LEGACY_PAGES

  constructor() {
    this.name = SearchDelegatorName.PRIVATE_LEGACY_PAGES;
  }

  async search(data: SearchableData | null, user, userGroups, option): Promise<ISearchResult<IPage>> {
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
    // if (false) {
    //   countQueryBuilder.addConditionToListWithDescendants(prefix);
    //   findQueryBuilder.addConditionToListWithDescendants(prefix);
    // }

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

  validateTerms(terms: QueryTerms): UnavailableTermsKey<MongoTermsKey>[] {
    return [];
  }

  excludeUnavailableTerms(terms: QueryTerms): MongoQueryTerms {
    return {
      match: [''],
      not_match: [''],
      prefix: [''],
      not_prefix: [''],
    };
  }

}

export default PrivateLegacyPagesDelegator;
