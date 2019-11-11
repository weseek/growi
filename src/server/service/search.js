// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:service:search');

class SearchService {

  constructor(crowi) {
    this.crowi = crowi;
    this.configManager = crowi.configManager;

    try {
      this.delegator = this.initDelegator();
    }
    catch (err) {
      logger.error(err);
    }

    if (this.isAvailable) {
      this.delegator.init();
      this.registerUpdateEvent();
    }
  }

  get isAvailable() {
    return this.delegator != null;
  }

  initDelegator() {
    logger.info('Initializing search delegator');

    const esUri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');
    const sbUrl = this.configManager.getConfig('crowi', 'app:searchboxSslUrl');

    const isSearchboxEnabled = sbUrl != null;
    const isElasticsearchEnabled = esUri != null;

    const searchEvent = this.crowi.event('search');

    if (isSearchboxEnabled) {
      logger.info('Searchbox is enabled');
      const SearchboxDelegator = require('./search-delegator/searchbox.js');
      return new SearchboxDelegator(sbUrl, this.configManager, searchEvent);
    }
    if (isElasticsearchEnabled) {
      logger.info('Elasticsearch (not Searchbox) is enabled');
      const ElasticsearchDelegator = require('./search-delegator/elasticsearch.js');
      return new ElasticsearchDelegator(esUri, this.configManager, searchEvent);
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

  getInfo() {
    return this.delegator.info({});
  }

  async buildIndex() {
    return this.delegator.buildIndex();
  }

  async searchKeyword(keyword, user, userGroups, searchOpts) {
    return this.delegator.searchKeyword(keyword, user, userGroups, searchOpts);
  }

}


// SearchClient.prototype.initClient = function() {
//     host = isSearchboxSsl
//       ? `${url.protocol}//${url.auth}${url.hostname}:443` // use 443 when Searchbox
//       : `${url.protocol}//${url.host}`;
// };


module.exports = SearchService;
