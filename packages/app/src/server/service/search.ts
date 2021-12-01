import RE2 from 're2';
import xss from 'xss';

import { SearchDelegatorName } from '~/interfaces/named-query';

import NamedQuery from '../models/named-query';
import {
  SearchDelegator, SearchQueryParser, SearchResolver, ParsedQuery, Result, MetaData, SearchableData, QueryTerms,
} from '../interfaces/search';
import ElasticsearchDelegator from './search-delegator/elasticsearch';
import PrivateLegacyPagesDelegator from './search-delegator/private-legacy-pages';

import loggerFactory from '~/utils/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:service:search');

// options for filtering xss
const filterXssOptions = {
  whiteList: {
    em: ['class'],
  },
};

const filterXss = new xss.FilterXSS(filterXssOptions);

const normalizeQueryString = (_queryString: string): string => {
  let queryString = _queryString.trim();
  queryString = queryString.replace(/\s+/g, ' ');

  return queryString;
};

class SearchService implements SearchQueryParser, SearchResolver {

  crowi!: any

  configManager!: any

  isErrorOccuredOnHealthcheck: boolean | null

  isErrorOccuredOnSearching: boolean | null

  fullTextSearchDelegator: any & SearchDelegator

  nqDelegators: {[key in SearchDelegatorName]: SearchDelegator}

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    this.isErrorOccuredOnHealthcheck = null;
    this.isErrorOccuredOnSearching = null;

    try {
      this.fullTextSearchDelegator = this.generateFullTextSearchDelegator();
      this.nqDelegators = this.generateNQDelegators(this.fullTextSearchDelegator);
      logger.info('Succeeded to initialize search delegators');
    }
    catch (err) {
      logger.error(err);
    }

    if (this.isConfigured) {
      this.fullTextSearchDelegator.init();
      this.registerUpdateEvent();
    }
  }

  get isConfigured() {
    return this.fullTextSearchDelegator != null;
  }

  get isReachable() {
    return this.isConfigured && !this.isErrorOccuredOnHealthcheck && !this.isErrorOccuredOnSearching;
  }

  get isElasticsearchEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');
    return uri != null && uri.length > 0;
  }

  generateFullTextSearchDelegator() {
    logger.info('Initializing search delegator');

    if (this.isElasticsearchEnabled) {
      logger.info('Elasticsearch is enabled');
      return new ElasticsearchDelegator(this.configManager, this.crowi.socketIoService);
    }

    logger.info('No elasticsearch URI is specified so that full text search is disabled.');
  }

  generateNQDelegators(defaultDelegator: SearchDelegator): {[key in SearchDelegatorName]: SearchDelegator} {
    return {
      [SearchDelegatorName.DEFAULT]: defaultDelegator,
      [SearchDelegatorName.PRIVATE_LEGACY_PAGES]: new PrivateLegacyPagesDelegator(),
    };
  }

  registerUpdateEvent() {
    const pageEvent = this.crowi.event('page');
    pageEvent.on('create', this.fullTextSearchDelegator.syncPageUpdated.bind(this.fullTextSearchDelegator));
    pageEvent.on('update', this.fullTextSearchDelegator.syncPageUpdated.bind(this.fullTextSearchDelegator));
    pageEvent.on('deleteCompletely', this.fullTextSearchDelegator.syncPagesDeletedCompletely.bind(this.fullTextSearchDelegator));
    pageEvent.on('delete', this.fullTextSearchDelegator.syncPageDeleted.bind(this.fullTextSearchDelegator));
    pageEvent.on('updateMany', this.fullTextSearchDelegator.syncPagesUpdated.bind(this.fullTextSearchDelegator));
    pageEvent.on('syncDescendants', this.fullTextSearchDelegator.syncDescendantsPagesUpdated.bind(this.fullTextSearchDelegator));
    pageEvent.on('addSeenUsers', this.delegator.syncPageUpdated.bind(this.delegator));

    const bookmarkEvent = this.crowi.event('bookmark');
    bookmarkEvent.on('create', this.fullTextSearchDelegator.syncBookmarkChanged.bind(this.fullTextSearchDelegator));
    bookmarkEvent.on('delete', this.fullTextSearchDelegator.syncBookmarkChanged.bind(this.fullTextSearchDelegator));

    const tagEvent = this.crowi.event('tag');
    tagEvent.on('update', this.fullTextSearchDelegator.syncTagChanged.bind(this.fullTextSearchDelegator));

    const commentEvent = this.crowi.event('comment');
    commentEvent.on('create', this.fullTextSearchDelegator.syncCommentChanged.bind(this.fullTextSearchDelegator));
    commentEvent.on('update', this.fullTextSearchDelegator.syncCommentChanged.bind(this.fullTextSearchDelegator));
    commentEvent.on('delete', this.fullTextSearchDelegator.syncCommentChanged.bind(this.fullTextSearchDelegator));
  }

  resetErrorStatus() {
    this.isErrorOccuredOnHealthcheck = false;
    this.isErrorOccuredOnSearching = false;
  }

  async reconnectClient() {
    logger.info('Try to reconnect...');
    this.fullTextSearchDelegator.initClient();

    try {
      await this.getInfoForHealth();

      logger.info('Reconnecting succeeded.');
      this.resetErrorStatus();
    }
    catch (err) {
      throw err;
    }
  }

  async getInfo() {
    try {
      return await this.fullTextSearchDelegator.getInfo();
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getInfoForHealth() {
    try {
      const result = await this.fullTextSearchDelegator.getInfoForHealth();

      this.isErrorOccuredOnHealthcheck = false;
      return result;
    }
    catch (err) {
      logger.error(err);

      // switch error flag, `isErrorOccuredOnHealthcheck` to be `false`
      this.isErrorOccuredOnHealthcheck = true;
      throw err;
    }
  }

  async getInfoForAdmin() {
    return this.fullTextSearchDelegator.getInfoForAdmin();
  }

  async normalizeIndices() {
    return this.fullTextSearchDelegator.normalizeIndices();
  }

  async rebuildIndex() {
    return this.fullTextSearchDelegator.rebuildIndex();
  }

  async parseSearchQuery(_queryString: string): Promise<ParsedQuery> {
    const regexp = new RE2(/^\[nq:.+\]$/g); // https://regex101.com/r/FzDUvT/1
    const replaceRegexp = new RE2(/\[nq:|\]/g);

    const queryString = normalizeQueryString(_queryString);

    // when Normal Query
    if (!regexp.test(queryString)) {
      return { queryString, terms: this.parseQueryString(queryString) };
    }

    // when Named Query
    const name = queryString.replace(replaceRegexp, '');
    const nq = await NamedQuery.findOne({ name });

    // will delegate to full-text search
    if (nq == null) {
      return { queryString, terms: this.parseQueryString(queryString) };
    }

    const { aliasOf, delegatorName } = nq;

    let parsedQuery;
    if (aliasOf != null) {
      parsedQuery = { queryString: normalizeQueryString(aliasOf), terms: this.parseQueryString(aliasOf) };
    }
    if (delegatorName != null) {
      parsedQuery = { queryString, delegatorName };
    }

    return parsedQuery;
  }

  async resolve(parsedQuery: ParsedQuery): Promise<[SearchDelegator, SearchableData | null]> {
    const { queryString, terms, delegatorName } = parsedQuery;
    if (delegatorName != null) {
      const nqDelegator = this.nqDelegators[delegatorName];
      if (nqDelegator != null) {
        return [nqDelegator, null];
      }
    }

    const data = {
      queryString,
      terms: terms as QueryTerms,
    };
    return [this.nqDelegators[SearchDelegatorName.DEFAULT], data];
  }

  async searchKeyword(keyword: string, user, userGroups, searchOpts): Promise<Result<any> & MetaData> {
    let parsedQuery;
    // parse
    try {
      parsedQuery = await this.parseSearchQuery(keyword);
    }
    catch (err) {
      logger.error('Error occurred while parseSearchQuery', err);
      throw err;
    }

    let delegator;
    let data;
    // resolve
    try {
      [delegator, data] = await this.resolve(parsedQuery);
    }
    catch (err) {
      logger.error('Error occurred while resolving search delegator', err);
      throw err;
    }

    return delegator.search(data, user, userGroups, searchOpts);
  }

  parseQueryString(queryString: string): QueryTerms {
    // terms
    const matchWords: string[] = [];
    const notMatchWords: string[] = [];
    const phraseWords: string[] = [];
    const notPhraseWords: string[] = [];
    const prefixPaths: string[] = [];
    const notPrefixPaths: string[] = [];
    const tags: string[] = [];
    const notTags: string[] = [];

    // First: Parse phrase keywords
    const phraseRegExp = new RegExp(/(-?"[^"]+")/g);
    const phrases = queryString.match(phraseRegExp);

    if (phrases !== null) {
      queryString = queryString.replace(phraseRegExp, ''); // eslint-disable-line no-param-reassign

      phrases.forEach((phrase) => {
        phrase.trim();
        if (phrase.match(/^-/)) {
          notPhraseWords.push(phrase.replace(/^-/, ''));
        }
        else {
          phraseWords.push(phrase);
        }
      });
    }

    // Second: Parse other keywords (include minus keywords)
    queryString.split(' ').forEach((word) => {
      if (word === '') {
        return;
      }

      // https://regex101.com/r/pN9XfK/1
      const matchNegative = word.match(/^-(prefix:|tag:)?(.+)$/);
      // https://regex101.com/r/3qw9FQ/1
      const matchPositive = word.match(/^(prefix:|tag:)?(.+)$/);

      if (matchNegative != null) {
        if (matchNegative[1] === 'prefix:') {
          notPrefixPaths.push(matchNegative[2]);
        }
        else if (matchNegative[1] === 'tag:') {
          notTags.push(matchNegative[2]);
        }
        else {
          notMatchWords.push(matchNegative[2]);
        }
      }
      else if (matchPositive != null) {
        if (matchPositive[1] === 'prefix:') {
          prefixPaths.push(matchPositive[2]);
        }
        else if (matchPositive[1] === 'tag:') {
          tags.push(matchPositive[2]);
        }
        else {
          matchWords.push(matchPositive[2]);
        }
      }
    });

    const terms = {
      match: matchWords,
      not_match: notMatchWords,
      phrase: phraseWords,
      not_phrase: notPhraseWords,
      prefix: prefixPaths,
      not_prefix: notPrefixPaths,
      tag: tags,
      not_tag: notTags,
    };

    return terms;
  }

  /**
   * formatting result
   */
  formatResult(esResult) {
    esResult.data.forEach((data) => {
      const highlightData = data._highlight;
      const snippet = highlightData['body.en'] || highlightData['body.ja'] || '';
      const pathMatch = highlightData['path.en'] || highlightData['path.ja'] || '';

      data.elasticSearchResult = {
        snippet: filterXss.process(snippet),
        // todo: use filter xss.process() for matchedPath;
        matchedPath: pathMatch,
      };
    });
    return esResult;
  }

}

export default SearchService;
