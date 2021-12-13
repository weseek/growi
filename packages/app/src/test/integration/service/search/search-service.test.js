import mongoose from 'mongoose';

import SearchService from '~/server/service/search';
import NamedQuery from '~/server/models/named-query';

const { getInstance } = require('../../setup-crowi');

describe('SearchService test', () => {
  let crowi;
  let searchService;

  const DEFAULT = 'FullTextSearch';

  // let NamedQuery;

  let dummyAliasOf;

  let namedQuery1;
  let namedQuery2;

  const dummyFullTextSearchDelegator = {
    search() {
      return;
    },
  };

  beforeAll(async() => {
    crowi = await getInstance();
    searchService = new SearchService(crowi);
    searchService.nqDelegators = {
      ...searchService.nqDelegators,
      [DEFAULT]: dummyFullTextSearchDelegator, // override with dummy full-text search delegator
    };

    dummyAliasOf = 'match -notmatch "phrase" -"notphrase" prefix:/pre1 -prefix:/pre2 tag:Tag1 -tag:Tag2';

    await NamedQuery.insertMany([
      { name: 'named_query2', aliasOf: dummyAliasOf },
    ]);

    namedQuery1 = await NamedQuery.findOne({ name: 'named_query1' });
    namedQuery2 = await NamedQuery.findOne({ name: 'named_query2' });
  });


  describe('parseQueryString()', () => {
    test('should parse queryString', async() => {
      const queryString = 'match -notmatch "phrase" -"notphrase" prefix:/pre1 -prefix:/pre2 tag:Tag1 -tag:Tag2';
      const terms = await searchService.parseQueryString(queryString);

      const expected = { // QueryTerms
        match: ['match'],
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
  });

});
