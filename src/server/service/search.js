// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:service:search');

class SearchService {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    this.isErrorOccuredOnHealthcheck = null;
    this.isErrorOccuredOnSearching = null;

    try {
      this.delegator = this.initDelegator();
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
    return this.configManager.getConfig('crowi', 'app:searchboxSslUrl') != null;
  }

  get isElasticsearchEnabled() {
    return this.configManager.getConfig('crowi', 'app:elasticsearchUri') != null;
  }

  initDelegator() {
    logger.info('Initializing search delegator');

    if (this.isSearchboxEnabled) {
      logger.info('Searchbox is enabled');
      const SearchboxDelegator = require('./search-delegator/searchbox.js');
      return new SearchboxDelegator(this.configManager, this.crowi.socketIoService);
    }
    if (this.isElasticsearchEnabled) {
      logger.info('Elasticsearch (not Searchbox) is enabled');
      const ElasticsearchDelegator = require('./search-delegator/elasticsearch.js');
      return new ElasticsearchDelegator(this.configManager, this.crowi.socketIoService);
    }

  }

  registerUpdateEvent() {
    const pageEvent = this.crowi.event('page');
    pageEvent.on('create', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('update', this.delegator.syncPageUpdated.bind(this.delegator));
    pageEvent.on('delete', this.delegator.syncPageDeleted.bind(this.delegator));

    const bookmarkEvent = this.crowi.event('bookmark');
    bookmarkEvent.on('create', this.delegator.syncBookmarkChanged.bind(this.delegator));
    bookmarkEvent.on('delete', this.delegator.syncBookmarkChanged.bind(this.delegator));

    const tagEvent = this.crowi.event('tag');
    tagEvent.on('update', this.delegator.syncTagChanged.bind(this.delegator));
  }

  async initClient() {
    // reset error flag
    this.isErrorOccuredOnHealthcheck = false;
    this.isErrorOccuredOnSearching = false;

    return this.delegator.initClient();
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

  async searchKeyword(keyword, user, userGroups, searchOpts) {
    try {
      return await this.delegator.searchKeyword(keyword, user, userGroups, searchOpts);
    }
    catch (err) {
      logger.error(err);

      // switch error flag, `isReachable` to be `false`
      this.isErrorOccuredOnSearching = true;
      throw err;
    }
  }

}

module.exports = SearchService;
