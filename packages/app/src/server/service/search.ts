import mongoose from 'mongoose';
import RE2 from 're2';

import { NamedQueryModel, NamedQueryDocument } from '../models/named-query';
import {
  SearchDelegator, SearchQueryParser, SearchResolver, ParsedQuery, Result, MetaData,
} from '../interfaces/search';

import loggerFactory from '~/utils/logger';

// eslint-disable-next-line no-unused-vars
const logger = loggerFactory('growi:service:search');

class SearchService implements SearchQueryParser, SearchResolver {

  crowi!: any

  configManager!: any

  isErrorOccuredOnHealthcheck: boolean | null

  isErrorOccuredOnSearching: boolean | null

  delegator: any & SearchDelegator

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
    // TODO: impl parser
    return {} as ParsedQuery;
  }

  async resolve(parsedQuery: ParsedQuery): Promise<SearchDelegator> {
    // TODO: impl resolve
    return {} as SearchDelegator;
  }

  async searchKeyword(keyword: string, user, userGroups, searchOpts): Promise<Result<any> & MetaData> {
    // TODO: parse
    // TODO: resolve
    // TODO: search
    return {} as Result<any> & MetaData;
  }

}

export default SearchService;
