import SearchService from '~/server/service/search';

const { getInstance } = require('../../setup-crowi');

describe('SearchService test', () => {
  let crowi;
  let searchService;
  const queryString1 = 'match -notmatch "phrase" -"notphrase" [nq:named_query] prefix:/pre1 -prefix:/pre2 tag:Tag1 -tag:Tag2';

  beforeAll(async() => {
    crowi = await getInstance();
    searchService = new SearchService(crowi);
  });


  describe('parseSearchQuery()', () => {
    test('should parse queryString', async() => {
      const parsedQuery = await searchService.parseSearchQuery(queryString1);
      const expected = {
        queryString: queryString1,
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
        nqNames: ['named_query'],
      };

      expect(parsedQuery).toStrictEqual(expected);
    });
  });


});
