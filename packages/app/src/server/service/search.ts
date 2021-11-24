import mongoose from 'mongoose';

import { HasObjectId } from '~/interfaces/has-object-id';
import { IPage } from '~/interfaces/page';
import { NamedQueryModel, NamedQueryDocument } from '../models/named-query';

import loggerFactory from '~/utils/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:service:search');

export type SearchResult = {
  data: IPage & HasObjectId
  meta?: any
}

type ParsedQuery = {
  queryString: string
  namedQueries: NamedQueryDocument[]
  shouldSearchKeyword: boolean
}

class SearchService {

  crowi!: any

  configManager!: any

  isErrorOccuredOnHealthcheck: boolean | null

  isErrorOccuredOnSearching: boolean | null

  delegator: any

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

  get isSearchboxEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:searchboxSslUrl');
    return uri != null && uri.length > 0;
  }

  get isElasticsearchEnabled() {
    const uri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');
    return uri != null && uri.length > 0;
  }

  generateDelegator() {
    logger.info('Initializing search delegator');

    if (this.isSearchboxEnabled) {
      const SearchboxDelegator = require('./search-delegator/searchbox');
      logger.info('Searchbox is enabled');
      return new SearchboxDelegator(this.configManager, this.crowi.socketIoService);
    }
    if (this.isElasticsearchEnabled) {
      const ElasticsearchDelegator = require('./search-delegator/elasticsearch');
      logger.info('Elasticsearch (not Searchbox) is enabled');
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
    let shouldSearchKeyword = false;

    // do not reassign queryString
    let queryString = _queryString.trim();
    queryString = _queryString.replace(/\s+/, ' ');
    const namedQueryRegExp = /^\[\.+\]$/g;

    const queryParts = queryString.split(' ');
    const namedQueryNames = queryParts
      .filter(str => namedQueryRegExp.test(str)) // filter by regexp
      .map(str => str.replace(/\[|\]/g, '')); // remove []

    const allCount = queryParts.length;
    const namedQueriesCount = namedQueryNames.length;
    if (allCount > 0 && allCount === namedQueriesCount) {
      shouldSearchKeyword = true;
    }

    // find NamedQuery
    const NamedQuery: NamedQueryModel = mongoose.model('NamedQuery');
    const namedQueries = namedQueryNames.length ? await NamedQuery.find({ name: { $in: namedQueryNames } }) : [];
    return { queryString, namedQueries, shouldSearchKeyword };
  }

  async searchKeyword(keyword, user, userGroups, searchOpts): Promise<SearchResult> {
    // TODO: call parseQueryString then call necessary search methods
    let parsedQuery: ParsedQuery;
    try {
      parsedQuery = await this.parseSearchQuery(keyword);
    }
    catch (err) {
      logger.error('Failed to parse query string', err);
      throw Error('Failed to parse query string');
    }
    const { queryString, namedQueries, shouldSearchKeyword } = parsedQuery;

    const result = await Promise.all(namedQueries.map(async(namedQuery) => {
      return this.searchByNamedQuery(namedQuery, user, userGroups, searchOpts);
    }));
    // if namedQuery.queryString != null { return await this.delegator.searchKeyword(keyword.concat(' ', queryString), user, userGroups, searchOpts) }
    // else if namedQuery.resolverName != null { return await this.resolveSearch(resolverName, user, userGroups, searchOpts) }

    let searchKeywordResult: SearchResult;
    try {
      searchKeywordResult = shouldSearchKeyword ? this.delegator.searchKeyword(keyword, user, userGroups, searchOpts) : {};
    }
    catch (err) {
      logger.error(err);

      // switch error flag, `isReachable` to be `false`
      this.isErrorOccuredOnSearching = true;
      throw err;
    }

    return {
      data: { ...searchKeywordResult.data },
      meta: { ...searchKeywordResult.meta },
    };
  }

  async searchByNamedQuery(namedQuery: NamedQueryDocument, user, userGroups, searchOpts): Promise<SearchResult> {
    const { resolverName } = namedQuery;

    switch (resolverName) {
      default:
        break;
    }

    return {} as SearchResult;
  }

}

export default SearchService;
