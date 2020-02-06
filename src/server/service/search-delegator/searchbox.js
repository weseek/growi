// eslint-disable-next-line no-unused-vars
const logger = require('@alias/logger')('growi:service:search-delegator:searchbox');

const ElasticsearchDelegator = require('./elasticsearch');

class SearchboxDelegator extends ElasticsearchDelegator {

  /**
   * @inheritdoc
   */
  getConnectionInfo() {
    const searchboxSslUrl = this.configManager.getConfig('crowi', 'app:searchboxSslUrl');
    const url = new URL(searchboxSslUrl);

    const indexName = 'crowi';
    const host = `${url.protocol}//${url.username}:${url.password}@${url.host}:443`;

    return {
      host,
      httpAuth: '',
      indexName,
    };
  }

  /**
   * @inheritdoc
   */
  async rebuildIndex() {
    const { client, indexName, aliasName } = this;

    // flush index
    await client.indices.delete({
      index: indexName,
    });
    await this.createIndex(indexName);
    await this.addAllPages();

    // put alias
    await client.indices.putAlias({
      name: aliasName,
      index: indexName,
    });
  }

}

module.exports = SearchboxDelegator;
