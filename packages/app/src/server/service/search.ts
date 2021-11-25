import mongoose from 'mongoose';
import RE2 from 're2';

import { NamedQueryModel, NamedQueryDocument } from '../models/named-query';
import {
  SearchDelegator, SearchQueryParser, SearchResolver, ParsedQuery, Result, MetaData, SearchableData, QueryTerms,
} from '../interfaces/search';

import loggerFactory from '~/utils/logger';
import { SearchDelegatorName } from '~/interfaces/named-query';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:service:search');

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

  delegator: any & SearchDelegator

  nqDelegators: {[delegatorName:string]: SearchDelegator} // TODO: initialize

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    this.isErrorOccuredOnHealthcheck = null;
    this.isErrorOccuredOnSearching = null;

    try {
      this.delegator = this.generateDelegator();
    }
    catch (err) {
      logger.error(err);
    }

    if (this.isConfigured) {
      this.delegator.init();
      this.registerUpdateEvent();
    }
  }

  get isConfigured() {
    return this.delegator != null;
  }

  get isReachable() {
    return this.isConfigured && !this.isErrorOccuredOnHealthcheck && !this.isErrorOccuredOnSearching;
  }

  get isElasticsearchEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');
    return uri != null && uri.length > 0;
  }

  generateDelegator() {
    logger.info('Initializing search delegator');

    if (this.isElasticsearchEnabled) {
      const ElasticsearchDelegator = require('./search-delegator/elasticsearch');
      logger.info('Elasticsearch is enabled');
      return new ElasticsearchDelegator(this.configManager, this.crowi.socketIoService);
    }

    logger.info('No elasticsearch URI is specified so that full text search is disabled.');
  }

  registerUpdateEvent() {
    const pageEvent = this.crowi.event('page');
    pageEvent.on('create', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('update', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('deleteCompletely', this.delegator.syncPagesDeletedCompletely.bind(this.delegator));
    pageEvent.on('delete', this.delegator.syncPageDeleted.bind(this.delegator));
    pageEvent.on('updateMany', this.delegator.syncPagesUpdated.bind(this.delegator));
    pageEvent.on('syncDescendants', this.delegator.syncDescendantsPagesUpdated.bind(this.delegator));

    const bookmarkEvent = this.crowi.event('bookmark');
    bookmarkEvent.on('create', this.delegator.syncBookmarkChanged.bind(this.delegator));
    bookmarkEvent.on('delete', this.delegator.syncBookmarkChanged.bind(this.delegator));

    const tagEvent = this.crowi.event('tag');
    tagEvent.on('update', this.delegator.syncTagChanged.bind(this.delegator));
  }

  resetErrorStatus() {
    this.isErrorOccuredOnHealthcheck = false;
    this.isErrorOccuredOnSearching = false;
  }

  async reconnectClient() {
    logger.info('Try to reconnect...');
    this.delegator.initClient();

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
      return await this.delegator.getInfo();
    }
    catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async getInfoForHealth() {
    try {
      const result = await this.delegator.getInfoForHealth();

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
    return this.delegator.getInfoForAdmin();
  }

  async normalizeIndices() {
    return this.delegator.normalizeIndices();
  }

  async rebuildIndex() {
    return this.delegator.rebuildIndex();
  }

  async parseSearchQuery(_queryString: string): Promise<ParsedQuery> {
    const nqNames: string[] = [];
    const regexp = new RE2(/^\[nq:.+\]$/g); // https://regex101.com/r/FzDUvT/1

    const queryString = normalizeQueryString(_queryString);

    queryString.split(' ').forEach((word) => {
      const isNamedQuery = regexp.test(word);

      if (isNamedQuery) {
        nqNames.push(word.replace(/\[nq:|\]/g, '')); // remove '[nq:' and ']'
      }
    });

    return { queryString: _queryString, nqNames };
  }

  async resolve(parsedQuery: ParsedQuery): Promise<[SearchDelegator, SearchableData | null]> {
    const { queryString, nqNames } = parsedQuery;

    if (nqNames.length === 0) {
      return this.delegator.search(queryString);
    }

    // find NamedQuery
    const NamedQuery: NamedQueryModel = mongoose.model('NamedQuery');
    const namedQueries = await NamedQuery.find({ name: { $in: nqNames } });

    const delegatableNamedQuery = namedQueries.filter(nq => nq.delegatorName != null)[0]; // only the first named query is valid

    if (delegatableNamedQuery == null) {
      // expand aliasOf
      // search with new qs
    }

    const nqDelegator = this.nqDelegators[delegatableNamedQuery.delegatorName as SearchDelegatorName];
    if (nqDelegator != null) {
      return [nqDelegator, null];
    }

    return [this.delegator, null];

    // TODO: impl resolve
    return [{}, {}] as [SearchDelegator, SearchableData];
  }

  async searchKeyword(keyword: string, user, userGroups, searchOpts): Promise<Result<any> & MetaData> {
    // parse
    const parsedQuery = await this.parseSearchQuery(keyword);
    // resolve
    const delegator = await this.resolve(parsedQuery);

    // TODO: search
    return {} as Result<any> & MetaData;
  }

  async parseQueryString(_queryString: string): Promise<QueryTerms> {
    // terms
    const matchWords: string[] = [];
    const notMatchWords: string[] = [];
    const phraseWords: string[] = [];
    const notPhraseWords: string[] = [];
    const prefixPaths: string[] = [];
    const notPrefixPaths: string[] = [];
    const tags: string[] = [];
    const notTags: string[] = [];

    let queryString = _queryString.trim();
    queryString = queryString.replace(/\s+/g, ' '); // eslint-disable-line no-param-reassign

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

}

export default SearchService;
