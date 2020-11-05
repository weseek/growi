const logger = require('@alias/logger')('growi:service:search-delegator:elasticsearch');
const elasticsearch = require('elasticsearch');
const mongoose = require('mongoose');

const { URL } = require('url');

const {
  Writable, Transform,
} = require('stream');
const streamToPromise = require('stream-to-promise');

const { createBatchStream } = require('@server/util/batch-stream');

const DEFAULT_OFFSET = 0;
const DEFAULT_LIMIT = 50;
const BULK_REINDEX_SIZE = 100;

class ElasticsearchDelegator {

  constructor(configManager, socketIoService) {
    this.configManager = configManager;
    this.socketIoService = socketIoService;

    this.client = null;

    // In Elasticsearch RegExp, we don't need to used ^ and $.
    // Ref: https://www.elastic.co/guide/en/elasticsearch/reference/5.6/query-dsl-regexp-query.html#_standard_operators
    this.queries = {
      PORTAL: {
        regexp: {
          'path.raw': '.*/',
        },
      },
      PUBLIC: {
        regexp: {
          'path.raw': '.*[^/]',
        },
      },
      USER: {
        prefix: {
          'path.raw': '/user/',
        },
      },
    };

    this.initClient();
  }

  get aliasName() {
    return `${this.indexName}-alias`;
  }

  shouldIndexed(page) {
    return page.revision != null && page.redirectTo == null;
  }

  initClient() {
    const { host, httpAuth, indexName } = this.getConnectionInfo();
    this.client = new elasticsearch.Client({
      host,
      httpAuth,
      requestTimeout: this.configManager.getConfig('crowi', 'app:elasticsearchRequestTimeout'),
      // log: 'debug',
    });
    this.indexName = indexName;
  }

  /**
   * return information object to connect to ES
   * @return {object} { host, httpAuth, indexName}
   */
  getConnectionInfo() {
    let indexName = 'crowi';
    let host = this.esUri;
    let httpAuth = '';

    const elasticsearchUri = this.configManager.getConfig('crowi', 'app:elasticsearchUri');

    const url = new URL(elasticsearchUri);
    if (url.pathname !== '/') {
      host = `${url.protocol}//${url.host}`;
      indexName = url.pathname.substring(1); // omit heading slash

      if (url.username != null && url.password != null) {
        httpAuth = `${url.username}:${url.password}`;
      }
    }

    return {
      host,
      httpAuth,
      indexName,
    };
  }

  async init() {
    return this.normalizeIndices();
  }

  /**
   * return Nodes Info
   * `cluster:monitor/nodes/info` privilege is required on ES
   * @return {object} `{ esVersion, esNodeInfos }`
   *
   * @see https://www.elastic.co/guide/en/elasticsearch/reference/6.6/cluster-nodes-info.html
   */
  async getInfo() {
    const info = await this.client.nodes.info();
    if (!info._nodes || !info.nodes) {
      throw new Error('There is no nodes');
    }

    let esVersion = 'unknown';
    const esNodeInfos = {};

    for (const [nodeName, nodeInfo] of Object.entries(info.nodes)) {
      esVersion = nodeInfo.version;

      const filteredInfo = {
        name: nodeInfo.name,
        version: nodeInfo.version,
        plugins: nodeInfo.plugins.map((pluginInfo) => {
          return {
            name: pluginInfo.name,
            version: pluginInfo.version,
          };
        }),
      };

      esNodeInfos[nodeName] = filteredInfo;
    }

    return { esVersion, esNodeInfos };
  }

  /**
   * return Cluster Health
   * `cluster:monitor/health` privilege is required on ES
   * @return {object} `{ esClusterHealth }`
   *
   * @see https://www.elastic.co/guide/en/elasticsearch/reference/6.6/cluster-health.html
   */
  async getInfoForHealth() {
    const esClusterHealth = await this.client.cluster.health();
    return { esClusterHealth };
  }

  /**
   * Return information for Admin Full Text Search Management page
   */
  async getInfoForAdmin() {
    const { client, indexName, aliasName } = this;

    const tmpIndexName = `${indexName}-tmp`;

    // check existence
    const isExistsMainIndex = await client.indices.exists({ index: indexName });
    const isExistsTmpIndex = await client.indices.exists({ index: tmpIndexName });

    // create indices name list
    const existingIndices = [];
    if (isExistsMainIndex) { existingIndices.push(indexName) }
    if (isExistsTmpIndex) { existingIndices.push(tmpIndexName) }

    // results when there is no indices
    if (existingIndices.length === 0) {
      return {
        indices: [],
        aliases: [],
        isNormalized: false,
      };
    }

    const { indices } = await client.indices.stats({ index: existingIndices, ignore_unavailable: true, metric: ['docs', 'store', 'indexing'] });
    const aliases = await client.indices.getAlias({ index: existingIndices });

    const isMainIndexHasAlias = isExistsMainIndex && aliases[indexName].aliases != null && aliases[indexName].aliases[aliasName] != null;
    const isTmpIndexHasAlias = isExistsTmpIndex && aliases[tmpIndexName].aliases != null && aliases[tmpIndexName].aliases[aliasName] != null;

    const isNormalized = isExistsMainIndex && isMainIndexHasAlias && !isExistsTmpIndex && !isTmpIndexHasAlias;

    return {
      indices,
      aliases,
      isNormalized,
    };
  }

  /**
   * rebuild index
   */
  async rebuildIndex() {
    const { client, indexName, aliasName } = this;

    const tmpIndexName = `${indexName}-tmp`;

    try {
      // reindex to tmp index
      await this.createIndex(tmpIndexName);
      await client.reindex({
        waitForCompletion: false,
        body: {
          source: { index: indexName },
          dest: { index: tmpIndexName },
        },
      });

      // update alias
      await client.indices.updateAliases({
        body: {
          actions: [
            { add: { alias: aliasName, index: tmpIndexName } },
            { remove: { alias: aliasName, index: indexName } },
          ],
        },
      });

      // flush index
      await client.indices.delete({
        index: indexName,
      });
      await this.createIndex(indexName);
      await this.addAllPages();
    }
    catch (error) {
      logger.warn('An error occured while \'rebuildIndex\', normalize indices anyway.');

      const socket = this.socketIoService.getAdminSocket();
      socket.emit('rebuildingFailed', { error: error.message });

      throw error;
    }
    finally {
      await this.normalizeIndices();
    }

  }

  async normalizeIndices() {
    const { client, indexName, aliasName } = this;

    const tmpIndexName = `${indexName}-tmp`;

    // remove tmp index
    const isExistsTmpIndex = await client.indices.exists({ index: tmpIndexName });
    if (isExistsTmpIndex) {
      await client.indices.delete({ index: tmpIndexName });
    }

    // create index
    const isExistsIndex = await client.indices.exists({ index: indexName });
    if (!isExistsIndex) {
      await this.createIndex(indexName);
    }

    // create alias
    const isExistsAlias = await client.indices.existsAlias({ name: aliasName, index: indexName });
    if (!isExistsAlias) {
      await client.indices.putAlias({
        name: aliasName,
        index: indexName,
      });
    }
  }

  async createIndex(index) {
    const body = require('@root/resource/search/mappings.json');
    return this.client.indices.create({ index, body });
  }

  /**
   * generate object that is related to page.grant*
   */
  generateDocContentsRelatedToRestriction(page) {
    let grantedUserIds = null;
    if (page.grantedUsers != null && page.grantedUsers.length > 0) {
      grantedUserIds = page.grantedUsers.map((user) => {
        const userId = (user._id == null) ? user : user._id;
        return userId.toString();
      });
    }

    let grantedGroupId = null;
    if (page.grantedGroup != null) {
      const groupId = (page.grantedGroup._id == null) ? page.grantedGroup : page.grantedGroup._id;
      grantedGroupId = groupId.toString();
    }

    return {
      grant: page.grant,
      granted_users: grantedUserIds,
      granted_group: grantedGroupId,
    };
  }

  prepareBodyForCreate(body, page) {
    if (!Array.isArray(body)) {
      throw new Error('Body must be an array.');
    }

    const command = {
      index: {
        _index: this.indexName,
        _type: 'pages',
        _id: page._id.toString(),
      },
    };

    const bookmarkCount = page.bookmarkCount || 0;
    let document = {
      path: page.path,
      body: page.revision.body,
      // username: page.creator?.username, // available Node.js v14 and above
      username: page.creator != null ? page.creator.username : null,
      comment_count: page.commentCount,
      bookmark_count: bookmarkCount,
      like_count: page.liker.length || 0,
      created_at: page.createdAt,
      updated_at: page.updatedAt,
      tag_names: page.tagNames,
    };

    document = Object.assign(document, this.generateDocContentsRelatedToRestriction(page));

    body.push(command);
    body.push(document);
  }

  prepareBodyForDelete(body, page) {
    if (!Array.isArray(body)) {
      throw new Error('Body must be an array.');
    }

    const command = {
      delete: {
        _index: this.indexName,
        _type: 'pages',
        _id: page._id.toString(),
      },
    };

    body.push(command);
  }

  addAllPages() {
    const Page = mongoose.model('Page');
    return this.updateOrInsertPages(() => Page.find(), true);
  }

  updateOrInsertPageById(pageId) {
    const Page = mongoose.model('Page');
    return this.updateOrInsertPages(() => Page.findById(pageId));
  }

  /**
   * @param {function} queryFactory factory method to generate a Mongoose Query instance
   */
  async updateOrInsertPages(queryFactory, isEmittingProgressEvent = false) {
    const Page = mongoose.model('Page');
    const { PageQueryBuilder } = Page;
    const Bookmark = mongoose.model('Bookmark');
    const PageTagRelation = mongoose.model('PageTagRelation');

    const socket = this.socketIoService.getAdminSocket();

    // prepare functions invoked from custom streams
    const prepareBodyForCreate = this.prepareBodyForCreate.bind(this);
    const shouldIndexed = this.shouldIndexed.bind(this);
    const bulkWrite = this.client.bulk.bind(this.client);

    const findQuery = new PageQueryBuilder(queryFactory()).addConditionToExcludeRedirect().query;
    const countQuery = new PageQueryBuilder(queryFactory()).addConditionToExcludeRedirect().query;

    const totalCount = await countQuery.count();

    const readStream = findQuery
      // populate data which will be referenced by prepareBodyForCreate()
      .populate([
        { path: 'creator', model: 'User', select: 'username' },
        { path: 'revision', model: 'Revision', select: 'body' },
      ])
      .lean()
      .cursor();

    let skipped = 0;
    const thinOutStream = new Transform({
      objectMode: true,
      async transform(doc, encoding, callback) {
        if (shouldIndexed(doc)) {
          this.push(doc);
        }
        else {
          skipped++;
        }
        callback();
      },
    });

    const batchStream = createBatchStream(BULK_REINDEX_SIZE);

    const appendBookmarkCountStream = new Transform({
      objectMode: true,
      async transform(chunk, encoding, callback) {
        const pageIds = chunk.map(doc => doc._id);

        const idToCountMap = await Bookmark.getPageIdToCountMap(pageIds);
        const idsHavingCount = Object.keys(idToCountMap);

        // append count
        chunk
          .filter(doc => idsHavingCount.includes(doc._id.toString()))
          .forEach((doc) => {
            // append count from idToCountMap
            doc.bookmarkCount = idToCountMap[doc._id.toString()];
          });

        this.push(chunk);
        callback();
      },
    });

    const appendTagNamesStream = new Transform({
      objectMode: true,
      async transform(chunk, encoding, callback) {
        const pageIds = chunk.map(doc => doc._id);

        const idToTagNamesMap = await PageTagRelation.getIdToTagNamesMap(pageIds);
        const idsHavingTagNames = Object.keys(idToTagNamesMap);

        // append tagNames
        chunk
          .filter(doc => idsHavingTagNames.includes(doc._id.toString()))
          .forEach((doc) => {
            // append tagName from idToTagNamesMap
            doc.tagNames = idToTagNamesMap[doc._id.toString()];
          });

        this.push(chunk);
        callback();
      },
    });

    let count = 0;
    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        const body = [];
        batch.forEach(doc => prepareBodyForCreate(body, doc));

        try {
          const res = await bulkWrite({
            body,
            requestTimeout: Infinity,
          });

          count += (res.items || []).length;

          logger.info(`Adding pages progressing: (count=${count}, errors=${res.errors}, took=${res.took}ms)`);

          if (isEmittingProgressEvent) {
            socket.emit('addPageProgress', { totalCount, count, skipped });
          }
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }

        callback();
      },
      final(callback) {
        logger.info(`Adding pages has completed: (totalCount=${totalCount}, skipped=${skipped})`);

        if (isEmittingProgressEvent) {
          socket.emit('finishAddPage', { totalCount, count, skipped });
        }
        callback();
      },
    });

    readStream
      .pipe(thinOutStream)
      .pipe(batchStream)
      .pipe(appendBookmarkCountStream)
      .pipe(appendTagNamesStream)
      .pipe(writeStream);

    return streamToPromise(writeStream);

  }

  deletePages(pages) {
    const self = this;
    const body = [];

    pages.map((page) => {
      self.prepareBodyForDelete(body, page);
      return;
    });

    logger.debug('deletePages(): Sending Request to ES', body);
    return this.client.bulk({
      body,
    });
  }

  /**
   * search returning type:
   * {
   *   meta: { total: Integer, results: Integer},
   *   data: [ pages ...],
   * }
   */
  async search(query) {
    // for debug
    if (process.env.NODE_ENV === 'development') {
      const result = await this.client.indices.validateQuery({
        explain: true,
        body: {
          query: query.body.query,
        },
      });
      logger.debug('ES returns explanations: ', result.explanations);
    }

    const result = await this.client.search(query);

    // for debug
    logger.debug('ES result: ', result);

    return {
      meta: {
        took: result.took,
        total: result.hits.total,
        results: result.hits.hits.length,
      },
      data: result.hits.hits.map((elm) => {
        return { _id: elm._id, _score: elm._score, _source: elm._source };
      }),
    };
  }

  createSearchQuerySortedByUpdatedAt(option) {
    // getting path by default is almost for debug
    let fields = ['path', 'bookmark_count', 'tag_names'];
    if (option) {
      fields = option.fields || fields;
    }

    // default is only id field, sorted by updated_at
    const query = {
      index: this.aliasName,
      type: 'pages',
      body: {
        sort: [{ updated_at: { order: 'desc' } }],
        query: {}, // query
        _source: fields,
      },
    };
    this.appendResultSize(query);

    return query;
  }

  createSearchQuerySortedByScore(option) {
    let fields = ['path', 'bookmark_count', 'tag_names'];
    if (option) {
      fields = option.fields || fields;
    }

    // sort by score
    const query = {
      index: this.aliasName,
      type: 'pages',
      body: {
        sort: [{ _score: { order: 'desc' } }],
        query: {}, // query
        _source: fields,
      },
    };
    this.appendResultSize(query);

    return query;
  }

  appendResultSize(query, from, size) {
    query.from = from || DEFAULT_OFFSET;
    query.size = size || DEFAULT_LIMIT;
  }

  initializeBoolQuery(query) {
    // query is created by createSearchQuerySortedByScore() or createSearchQuerySortedByUpdatedAt()
    if (!query.body.query.bool) {
      query.body.query.bool = {};
    }

    const isInitialized = (query) => { return !!query && Array.isArray(query) };

    if (!isInitialized(query.body.query.bool.filter)) {
      query.body.query.bool.filter = [];
    }
    if (!isInitialized(query.body.query.bool.must)) {
      query.body.query.bool.must = [];
    }
    if (!isInitialized(query.body.query.bool.must_not)) {
      query.body.query.bool.must_not = [];
    }
    return query;
  }

  appendCriteriaForQueryString(query, queryString) {
    query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

    // parse
    const parsedKeywords = this.parseQueryString(queryString);

    if (parsedKeywords.match.length > 0) {
      const q = {
        multi_match: {
          query: parsedKeywords.match.join(' '),
          type: 'most_fields',
          fields: ['path.ja^2', 'path.en^2', 'body.ja', 'body.en'],
        },
      };
      query.body.query.bool.must.push(q);
    }

    if (parsedKeywords.not_match.length > 0) {
      const q = {
        multi_match: {
          query: parsedKeywords.not_match.join(' '),
          fields: ['path.ja', 'path.en', 'body.ja', 'body.en'],
          operator: 'or',
        },
      };
      query.body.query.bool.must_not.push(q);
    }

    if (parsedKeywords.phrase.length > 0) {
      const phraseQueries = [];
      parsedKeywords.phrase.forEach((phrase) => {
        phraseQueries.push({
          multi_match: {
            query: phrase, // each phrase is quoteted words
            type: 'phrase',
            fields: [
              // Not use "*.ja" fields here, because we want to analyze (parse) search words
              'path.raw^2',
              'body',
            ],
          },
        });
      });

      query.body.query.bool.must.push(phraseQueries);
    }

    if (parsedKeywords.not_phrase.length > 0) {
      const notPhraseQueries = [];
      parsedKeywords.not_phrase.forEach((phrase) => {
        notPhraseQueries.push({
          multi_match: {
            query: phrase, // each phrase is quoteted words
            type: 'phrase',
            fields: [
              // Not use "*.ja" fields here, because we want to analyze (parse) search words
              'path.raw^2',
              'body',
            ],
          },
        });
      });

      query.body.query.bool.must_not.push(notPhraseQueries);
    }

    if (parsedKeywords.prefix.length > 0) {
      const queries = parsedKeywords.prefix.map((path) => {
        return { prefix: { 'path.raw': path } };
      });
      query.body.query.bool.filter.push({ bool: { should: queries } });
    }

    if (parsedKeywords.not_prefix.length > 0) {
      const queries = parsedKeywords.not_prefix.map((path) => {
        return { prefix: { 'path.raw': path } };
      });
      query.body.query.bool.filter.push({ bool: { must_not: queries } });
    }

    if (parsedKeywords.tag.length > 0) {
      const queries = parsedKeywords.tag.map((tag) => {
        return { term: { tag_names: tag } };
      });
      query.body.query.bool.filter.push({ bool: { must: queries } });
    }

    if (parsedKeywords.not_tag.length > 0) {
      const queries = parsedKeywords.not_tag.map((tag) => {
        return { term: { tag_names: tag } };
      });
      query.body.query.bool.filter.push({ bool: { must_not: queries } });
    }
  }

  async filterPagesByViewer(query, user, userGroups) {
    const showPagesRestrictedByOwner = !this.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByOwner');
    const showPagesRestrictedByGroup = !this.configManager.getConfig('crowi', 'security:list-policy:hideRestrictedByGroup');

    query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

    const Page = mongoose.model('Page');
    const {
      GRANT_PUBLIC, GRANT_RESTRICTED, GRANT_SPECIFIED, GRANT_OWNER, GRANT_USER_GROUP,
    } = Page;

    const grantConditions = [
      { term: { grant: GRANT_PUBLIC } },
    ];

    // ensure to hit to GRANT_RESTRICTED pages that the user specified at own
    if (user != null) {
      grantConditions.push(
        {
          bool: {
            must: [
              { term: { grant: GRANT_RESTRICTED } },
              { term: { granted_users: user._id.toString() } },
            ],
          },
        },
      );
    }

    if (showPagesRestrictedByOwner) {
      grantConditions.push(
        { term: { grant: GRANT_SPECIFIED } },
        { term: { grant: GRANT_OWNER } },
      );
    }
    else if (user != null) {
      grantConditions.push(
        {
          bool: {
            must: [
              { term: { grant: GRANT_SPECIFIED } },
              { term: { granted_users: user._id.toString() } },
            ],
          },
        },
        {
          bool: {
            must: [
              { term: { grant: GRANT_OWNER } },
              { term: { granted_users: user._id.toString() } },
            ],
          },
        },
      );
    }

    if (showPagesRestrictedByGroup) {
      grantConditions.push(
        { term: { grant: GRANT_USER_GROUP } },
      );
    }
    else if (userGroups != null && userGroups.length > 0) {
      const userGroupIds = userGroups.map((group) => { return group._id.toString() });
      grantConditions.push(
        {
          bool: {
            must: [
              { term: { grant: GRANT_USER_GROUP } },
              { terms: { granted_group: userGroupIds } },
            ],
          },
        },
      );
    }

    query.body.query.bool.filter.push({ bool: { should: grantConditions } });
  }

  filterPortalPages(query) {
    query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

    query.body.query.bool.must_not.push(this.queries.USER);
    query.body.query.bool.filter.push(this.queries.PORTAL);
  }

  filterPublicPages(query) {
    query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

    query.body.query.bool.must_not.push(this.queries.USER);
    query.body.query.bool.filter.push(this.queries.PUBLIC);
  }

  filterUserPages(query) {
    query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

    query.body.query.bool.filter.push(this.queries.USER);
  }

  filterPagesByType(query, type) {
    const Page = mongoose.model('Page');

    switch (type) {
      case Page.TYPE_PORTAL:
        return this.filterPortalPages(query);
      case Page.TYPE_PUBLIC:
        return this.filterPublicPages(query);
      case Page.TYPE_USER:
        return this.filterUserPages(query);
      default:
        return query;
    }
  }

  appendFunctionScore(query, queryString) {
    const User = mongoose.model('User');
    const count = User.count({}) || 1;

    const minScore = queryString.length * 0.1 - 1; // increase with length
    logger.debug('min_score: ', minScore);

    query.body.query = {
      function_score: {
        query: { ...query.body.query },
        // // disable min_score -- 2019.02.28 Yuki Takei
        // // more precise adjustment is needed...
        // min_score: minScore,
        field_value_factor: {
          field: 'bookmark_count',
          modifier: 'log1p',
          factor: 10000 / count,
          missing: 0,
        },
        boost_mode: 'sum',
      },
    };
  }

  async searchKeyword(queryString, user, userGroups, option) {
    const from = option.offset || null;
    const size = option.limit || null;
    const type = option.type || null;
    const query = this.createSearchQuerySortedByScore();
    this.appendCriteriaForQueryString(query, queryString);

    this.filterPagesByType(query, type);
    await this.filterPagesByViewer(query, user, userGroups);

    this.appendResultSize(query, from, size);

    this.appendFunctionScore(query, queryString);

    return this.search(query);
  }

  parseQueryString(queryString) {
    const matchWords = [];
    const notMatchWords = [];
    const phraseWords = [];
    const notPhraseWords = [];
    const prefixPaths = [];
    const notPrefixPaths = [];
    const tags = [];
    const notTags = [];

    queryString.trim();
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

    return {
      match: matchWords,
      not_match: notMatchWords,
      phrase: phraseWords,
      not_phrase: notPhraseWords,
      prefix: prefixPaths,
      not_prefix: notPrefixPaths,
      tag: tags,
      not_tag: notTags,
    };
  }

  async syncPageUpdated(page, user) {
    logger.debug('SearchClient.syncPageUpdated', page.path);

    // delete if page should not indexed
    if (!this.shouldIndexed(page)) {
      try {
        await this.deletePages([page]);
      }
      catch (err) {
        logger.error('deletePages:ES Error', err);
      }
      return;
    }

    return this.updateOrInsertPageById(page._id);
  }

  async syncPageDeleted(page, user) {
    logger.debug('SearchClient.syncPageDeleted', page.path);

    try {
      return await this.deletePages([page]);
    }
    catch (err) {
      logger.error('deletePages:ES Error', err);
    }
  }

  async syncBookmarkChanged(pageId) {
    logger.debug('SearchClient.syncBookmarkChanged', pageId);

    return this.updateOrInsertPageById(pageId);
  }

  async syncTagChanged(page) {
    logger.debug('SearchClient.syncTagChanged', page.path);

    return this.updateOrInsertPageById(page._id);
  }

}

module.exports = ElasticsearchDelegator;
