import mongoose from 'mongoose';

import SearchService from '~/server/service/search';
import NamedQuery from '~/server/models/named-query';

const { getInstance } = require('../../setup-crowi');

describe('SearchService test', () => {
  let crowi;
  let searchService;

  const DEFAULT = 'FullTextSearch';
  const PRIVATE_LEGACY_PAGES = 'PrivateLegacyPages';

  // let NamedQuery;

  let dummyAliasOf;

  let namedQuery1;
  let namedQuery2;

  const dummyDelegator = {
    search() {
      return;
    },
  };

  beforeAll(async() => {
    crowi = await getInstance();
    searchService = new SearchService(crowi);
    searchService.nqDelegators = {
      FullTextSearch: dummyDelegator,
    };

    dummyAliasOf = 'match -notmatch "phrase" -"notphrase" prefix:/pre1 -prefix:/pre2 tag:Tag1 -tag:Tag2';

    await NamedQuery.insertMany([
      { name: 'named_query1', delegatorName: PRIVATE_LEGACY_PAGES },
      { name: 'named_query2', aliasOf: dummyAliasOf },
    ]);

    namedQuery1 = await NamedQuery.findOne({ name: 'named_query1' });
    namedQuery2 = await NamedQuery.findOne({ name: 'named_query2' });
  });


  describe('parseQueryString()', () => {
    test('should parse queryString', async() => {
      const queryString = 'match -notmatch "phrase" -"notphrase" [nq:named_query] prefix:/pre1 -prefix:/pre2 tag:Tag1 -tag:Tag2';
      const terms = await searchService.parseQueryString(queryString);

      const expected = { // QueryTerms
        match: ['match', '[nq:named_query]'],
        not_match: ['notmatch'],
        phrase: ['"phrase"'],
        not_phrase: ['"notphrase"'],
        prefix: ['/pre1'],
        not_prefix: ['/pre2'],
        tag: ['Tag1'],
        not_tag: ['Tag2'],
      };

      expect(terms).toStrictEqual(expected);
    });
  });

  describe('parseSearchQuery()', () => {

    test('should return result with delegatorName', async() => {
      const queryString = '[nq:named_query1]';
      const parsedQuery = await searchService.parseSearchQuery(queryString);

      const expected = {
        queryString,
        delegatorName: PRIVATE_LEGACY_PAGES,
      };

      expect(parsedQuery).toStrictEqual(expected);
    });

    test('should return result with expanded aliasOf value', async() => {
      const queryString = '[nq:named_query2]';
      const parsedQuery = await searchService.parseSearchQuery(queryString);
      const expected = {
        queryString: dummyAliasOf,
        terms: {
          match: ['match'],
          not_match: ['notmatch'],
          phrase: ['"phrase"'],
          not_phrase: ['"notphrase"'],
          prefix: ['/pre1'],
          not_prefix: ['/pre2'],
          tag: ['Tag1'],
          not_tag: ['Tag2'],
        },
      };

      expect(parsedQuery).toStrictEqual(expected);
    });
  });

  describe('resolve()', () => {
    test('should resolve as full-text search delegator', async() => {
      const parsedQuery = {
        queryString: dummyAliasOf,
        terms: {
          match: ['match'],
          not_match: ['notmatch'],
          phrase: ['"phrase"'],
          not_phrase: ['"notphrase"'],
          prefix: ['/pre1'],
          not_prefix: ['/pre2'],
          tag: ['Tag1'],
          not_tag: ['Tag2'],
        },
      };

      const [delegator, data] = await searchService.resolve(parsedQuery);

      const expectedData = parsedQuery;

      expect(data).toStrictEqual(expectedData);
      expect(typeof delegator.search).toBe('function');
    });

    test('should resolve as custom search delegator', async() => {
      const queryString = '[nq:named_query1]';
      const parsedQuery = {
        queryString,
        delegatorName: PRIVATE_LEGACY_PAGES,
      };

      const [delegator, data] = await searchService.resolve(parsedQuery);

      const expectedData = null;

      expect(data).toBe(expectedData);
      expect(typeof delegator.search).toBe('function');
    });
  });

  describe('searchKeyword()', () => {
    test('should search with custom search delegator', async() => {
      const Page = mongoose.model('Page');
      const User = mongoose.model('User');
      await User.insertMany([
        { name: 'someone1', username: 'someone1', email: 'someone1@example.com' },
        { name: 'someone2', username: 'someone2', email: 'someone2@example.com' },
      ]);

      const testUser1 = await User.findOne({ username: 'someone1' });
      const testUser2 = await User.findOne({ username: 'someone2' });

      await Page.insertMany([
        {
          path: '/user1',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/user1_owner',
          grant: Page.GRANT_OWNER,
          creator: testUser1,
          lastUpdateUser: testUser1,
        },
        {
          path: '/user2_notOwner',
          grant: Page.GRANT_PUBLIC,
          creator: testUser2,
          lastUpdateUser: testUser2,
        },
      ]);

      const page1 = await Page.findOne({ path: '/user1' });

      await Page.insertMany([
        {
          path: '/user1/hasParent',
          grant: Page.GRANT_PUBLIC,
          creator: testUser1,
          lastUpdateUser: testUser1,
          parent: page1,
        },
      ]);

      const queryString = '[nq:named_query1]';
      const parsedQuery = {
        queryString,
        delegatorName: PRIVATE_LEGACY_PAGES,
      };

      const [delegator, data] = await searchService.resolve(parsedQuery);

      const result = await delegator.search(data, testUser1, null, { limit: 10, offset: 0 });

      const resultPaths = result.data.pages.map(page => page.path).sort();
      const expectedPaths = ['/user1', '/user1_owner'].sort();

      expect(resultPaths).toStrictEqual(expectedPaths);
    });
  });

});
