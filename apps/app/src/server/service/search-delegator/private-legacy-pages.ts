import type { IPage } from '@growi/core';
import { serializeUserSecurely } from '@growi/core/dist/models/serializers';
import mongoose from 'mongoose';

import { SearchDelegatorName } from '~/interfaces/named-query';
import type { ISearchResult } from '~/interfaces/search';
import type { PageModel, PageDocument, PageQueryBuilder } from '~/server/models/page';
import { serializePageSecurely } from '~/server/models/serializers';

import type {
  QueryTerms, MongoTermsKey,
  SearchableData, SearchDelegator, UnavailableTermsKey, MongoQueryTerms,
} from '../../interfaces/search';


const AVAILABLE_KEYS = ['match', 'not_match', 'prefix', 'not_prefix'];

class PrivateLegacyPagesDelegator implements SearchDelegator<IPage, MongoTermsKey, MongoQueryTerms> {

  name!: SearchDelegatorName.PRIVATE_LEGACY_PAGES;

  constructor() {
    this.name = SearchDelegatorName.PRIVATE_LEGACY_PAGES;
  }

  async search(data: SearchableData<MongoQueryTerms>, user, userGroups, option): Promise<ISearchResult<IPage>> {
    const { terms } = data;
    const { offset, limit } = option;

    if (offset == null || limit == null) {
      throw new Error('PrivateLegacyPagesDelegator requires pagination options (offset, limit).');
    }
    if (user == null && userGroups == null) {
      throw new Error('Either of user and userGroups must not be null.');
    }

    // find private legacy pages
    const Page = mongoose.model('Page') as unknown as PageModel;
    const { PageQueryBuilder } = Page;

    const countQueryBuilder = new PageQueryBuilder(Page.find());
    await countQueryBuilder.addConditionAsMigratablePages(user);
    const findQueryBuilder = new PageQueryBuilder(Page.find());
    await findQueryBuilder.addConditionAsMigratablePages(user);

    this.addConditionByTerms(countQueryBuilder, terms);
    this.addConditionByTerms(findQueryBuilder, terms);

    const total = await countQueryBuilder.query.count();

    const pages: PageDocument[] = await findQueryBuilder
      .addConditionToPagenate(offset, limit)
      .query
      .populate('creator')
      .populate('lastUpdateUser')
      .exec();

    return {
      data: pages.map(page => serializePageSecurely(page)),
      meta: {
        total,
        hitsCount: pages.length,
      },
    };
  }

  private addConditionByTerms(builder: PageQueryBuilder, terms: MongoQueryTerms): PageQueryBuilder {
    const {
      match, not_match: notMatch, prefix, not_prefix: notPrefix,
    } = terms;

    if (match.length > 0) {
      match.forEach(m => builder.addConditionToListByMatch(m));
    }
    if (notMatch.length > 0) {
      notMatch.forEach(nm => builder.addConditionToListByNotMatch(nm));
    }
    if (prefix.length > 0) {
      prefix.forEach(p => builder.addConditionToListByStartWith(p));
    }
    if (notPrefix.length > 0) {
      notPrefix.forEach(np => builder.addConditionToListByNotStartWith(np));
    }

    return builder;
  }

  isTermsNormalized(terms: Partial<QueryTerms>): terms is MongoQueryTerms {
    const entries = Object.entries(terms);

    return !entries.some(([key, val]) => !AVAILABLE_KEYS.includes(key) && typeof val?.length === 'number' && val.length > 0);
  }

  validateTerms(terms: QueryTerms): UnavailableTermsKey<MongoTermsKey>[] {
    const entries = Object.entries(terms);

    return entries
      .filter(([key, val]) => !AVAILABLE_KEYS.includes(key) && val.length > 0)
      .map(([key]) => key as UnavailableTermsKey<MongoTermsKey>); // use "as": https://github.com/microsoft/TypeScript/issues/41173
  }

}

export default PrivateLegacyPagesDelegator;
