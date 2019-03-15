/**
 * Search
 */

const elasticsearch = require('elasticsearch');
const debug = require('debug')('growi:lib:search');
const logger = require('@alias/logger')('growi:lib:search');

function SearchClient(crowi, esUri) {
  this.DEFAULT_OFFSET = 0;
  this.DEFAULT_LIMIT = 50;

  this.esNodeName = '-';
  this.esNodeNames = [];
  this.esVersion = 'unknown';
  this.esVersions = [];
  this.esPlugin = [];
  this.esPlugins = [];
  this.esUri = esUri;
  this.crowi = crowi;
  this.searchEvent = crowi.event('search');

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

  const uri = this.parseUri(this.esUri);
  this.host = uri.host;
  this.indexName = uri.indexName;

  this.client = new elasticsearch.Client({
    host: this.host,
    requestTimeout: 5000,
    // log: 'debug',
  });

  this.registerUpdateEvent();

  this.mappingFile = `${crowi.resourceDir}search/mappings.json`;
}

SearchClient.prototype.getInfo = function() {
  return this.client.info({});
};

SearchClient.prototype.checkESVersion = async function() {
  try {
    const nodes = await this.client.nodes.info();
    if (!nodes._nodes || !nodes.nodes) {
      throw new Error('no nodes info');
    }

    for (const [nodeName, nodeInfo] of Object.entries(nodes.nodes)) {
      this.esNodeName = nodeName;
      this.esNodeNames.push(nodeName);
      this.esVersion = nodeInfo.version;
      this.esVersions.push(nodeInfo.version);
      this.esPlugin = nodeInfo.plugins;
      this.esPlugins.push(nodeInfo.plugins);
    }
  }
  catch (error) {
    logger.error('es check version error:', error);
  }
};

SearchClient.prototype.registerUpdateEvent = function() {
  const pageEvent = this.crowi.event('page');
  pageEvent.on('create', this.syncPageCreated.bind(this));
  pageEvent.on('update', this.syncPageUpdated.bind(this));
  pageEvent.on('delete', this.syncPageDeleted.bind(this));

  const bookmarkEvent = this.crowi.event('bookmark');
  bookmarkEvent.on('create', this.syncBookmarkChanged.bind(this));
  bookmarkEvent.on('delete', this.syncBookmarkChanged.bind(this));
};

SearchClient.prototype.shouldIndexed = function(page) {
  return (page.redirectTo == null);
};

// BONSAI_URL is following format:
// => https://{ID}:{PASSWORD}@{HOST}
SearchClient.prototype.parseUri = function(uri) {
  let indexName = 'crowi';
  let host = uri;
  const match = uri.match(/^(https?:\/\/[^/]+)\/(.+)$/);
  if (match) {
    host = match[1];
    indexName = match[2];
  }

  return {
    host,
    indexName,
  };
};

SearchClient.prototype.buildIndex = function(uri) {
  return this.client.indices.create({
    index: this.indexName,
    body: require(this.mappingFile),
  });
};

SearchClient.prototype.deleteIndex = function(uri) {
  return this.client.indices.delete({
    index: this.indexName,
  });
};

/**
 * generate object that is related to page.grant*
 */
function generateDocContentsRelatedToRestriction(page) {
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

SearchClient.prototype.prepareBodyForUpdate = function(body, page) {
  if (!Array.isArray(body)) {
    throw new Error('Body must be an array.');
  }

  const command = {
    update: {
      _index: this.indexName,
      _type: 'pages',
      _id: page._id.toString(),
    },
  };

  let document = {
    path: page.path,
    body: page.revision.body,
    comment_count: page.commentCount,
    bookmark_count: page.bookmarkCount || 0,
    like_count: page.liker.length || 0,
    updated_at: page.updatedAt,
  };

  document = Object.assign(document, generateDocContentsRelatedToRestriction(page));

  body.push(command);
  body.push({
    doc: document,
    doc_as_upsert: true,
  });
};

SearchClient.prototype.prepareBodyForCreate = function(body, page) {
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
    username: page.creator.username,
    comment_count: page.commentCount,
    bookmark_count: bookmarkCount,
    like_count: page.liker.length || 0,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
  };

  document = Object.assign(document, generateDocContentsRelatedToRestriction(page));

  body.push(command);
  body.push(document);
};

SearchClient.prototype.prepareBodyForDelete = function(body, page) {
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
};

SearchClient.prototype.addPages = async function(pages) {
  const Bookmark = this.crowi.model('Bookmark');
  const body = [];

  /* eslint-disable no-await-in-loop */
  for (const page of pages) {
    page.bookmarkCount = await Bookmark.countByPageId(page._id);
    this.prepareBodyForCreate(body, page);
  }
  /* eslint-enable no-await-in-loop */

  logger.debug('addPages(): Sending Request to ES', body);
  return this.client.bulk({
    body,
  });
};

SearchClient.prototype.updatePages = function(pages) {
  const self = this;
  const body = [];

  pages.map((page) => {
    self.prepareBodyForUpdate(body, page);
    return;
  });

  logger.debug('updatePages(): Sending Request to ES', body);
  return this.client.bulk({
    body,
  });
};

SearchClient.prototype.deletePages = function(pages) {
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
};

SearchClient.prototype.addAllPages = async function() {
  const self = this;
  const Page = this.crowi.model('Page');
  const allPageCount = await Page.allPageCount();
  const Bookmark = this.crowi.model('Bookmark');
  const cursor = Page.getStreamOfFindAll();
  let body = [];
  let sent = 0;
  let skipped = 0;
  let total = 0;

  return new Promise((resolve, reject) => {
    const bulkSend = (body) => {
      self.client
        .bulk({
          body,
          requestTimeout: Infinity,
        })
        .then((res) => {
          logger.info('addAllPages add anyway (items, errors, took): ', (res.items || []).length, res.errors, res.took, 'ms');
        })
        .catch((err) => {
          logger.error('addAllPages error on add anyway: ', err);
        });
    };

    cursor
      .eachAsync(async(doc) => {
        if (!doc.creator || !doc.revision || !self.shouldIndexed(doc)) {
          // debug('Skipped', doc.path);
          skipped++;
          return;
        }
        total++;

        const bookmarkCount = await Bookmark.countByPageId(doc._id);
        const page = { ...doc, bookmarkCount };
        self.prepareBodyForCreate(body, page);

        if (body.length >= 4000) {
          // send each 2000 docs. (body has 2 elements for each data)
          sent++;
          logger.debug('Sending request (seq, total, skipped)', sent, total, skipped);
          bulkSend(body);
          this.searchEvent.emit('addPageProgress', allPageCount, total, skipped);

          body = [];
        }
      })
      .then(() => {
        // send all remaining data on body[]
        logger.debug('Sending last body of bulk operation:', body.length);
        bulkSend(body);
        this.searchEvent.emit('finishAddPage', allPageCount, total, skipped);

        resolve();
      })
      .catch((e) => {
        logger.error('Error wile iterating cursor.eachAsync()', e);
        reject(e);
      });
  });
};

/**
 * search returning type:
 * {
 *   meta: { total: Integer, results: Integer},
 *   data: [ pages ...],
 * }
 */
SearchClient.prototype.search = async function(query, tagFilters) {
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

  if (tagFilters.length > 0) {
    const Tag = this.crowi.model('Tag');

    const filters = tagFilters[0];
    const pageIds = await Tag.getRelatedPageIds(filters.tags);
    console.log('##########', pageIds);
  }

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
};

SearchClient.prototype.createSearchQuerySortedByUpdatedAt = function(option) {
  // getting path by default is almost for debug
  let fields = ['path', 'bookmark_count'];
  if (option) {
    fields = option.fields || fields;
  }

  // default is only id field, sorted by updated_at
  const query = {
    index: this.indexName,
    type: 'pages',
    body: {
      sort: [{ updated_at: { order: 'desc' } }],
      query: {}, // query
      _source: fields,
    },
  };
  this.appendResultSize(query);

  return query;
};

SearchClient.prototype.createSearchQuerySortedByScore = function(option) {
  let fields = ['path', 'bookmark_count'];
  if (option) {
    fields = option.fields || fields;
  }

  // sort by score
  const query = {
    index: this.indexName,
    type: 'pages',
    body: {
      sort: [{ _score: { order: 'desc' } }],
      query: {}, // query
      _source: fields,
    },
  };
  this.appendResultSize(query);

  return query;
};

SearchClient.prototype.appendResultSize = function(query, from, size) {
  query.from = from || this.DEFAULT_OFFSET;
  query.size = size || this.DEFAULT_LIMIT;
};

SearchClient.prototype.initializeBoolQuery = function(query) {
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
};

SearchClient.prototype.appendCriteriaForQueryString = function(query, queryString, tagFilters) {
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

  if (parsedKeywords.tags.length > 0) {
    tagFilters.push({ tags: parsedKeywords.tags });
  }
};

SearchClient.prototype.filterPagesByViewer = async function(query, user, userGroups) {
  const Config = this.crowi.model('Config');
  const config = this.crowi.getConfig();

  const showPagesRestrictedByOwner = !Config.hidePagesRestrictedByOwnerInList(config);
  const showPagesRestrictedByGroup = !Config.hidePagesRestrictedByGroupInList(config);

  query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

  const Page = this.crowi.model('Page');
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
};

SearchClient.prototype.filterPortalPages = function(query) {
  query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

  query.body.query.bool.must_not.push(this.queries.USER);
  query.body.query.bool.filter.push(this.queries.PORTAL);
};

SearchClient.prototype.filterPublicPages = function(query) {
  query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

  query.body.query.bool.must_not.push(this.queries.USER);
  query.body.query.bool.filter.push(this.queries.PUBLIC);
};

SearchClient.prototype.filterUserPages = function(query) {
  query = this.initializeBoolQuery(query); // eslint-disable-line no-param-reassign

  query.body.query.bool.filter.push(this.queries.USER);
};

SearchClient.prototype.filterPagesByType = function(query, type) {
  const Page = this.crowi.model('Page');

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
};

SearchClient.prototype.appendFunctionScore = function(query, queryString) {
  const User = this.crowi.model('User');
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
};

SearchClient.prototype.searchKeyword = async function(queryString, user, userGroups, option) {
  const from = option.offset || null;
  const size = option.limit || null;
  const type = option.type || null;
  const query = this.createSearchQuerySortedByScore();
  const tagFilters = [];
  this.appendCriteriaForQueryString(query, queryString, tagFilters);

  this.filterPagesByType(query, type);
  await this.filterPagesByViewer(query, user, userGroups);

  this.appendResultSize(query, from, size);

  this.appendFunctionScore(query, queryString);

  return this.search(query, tagFilters);
};

SearchClient.prototype.parseQueryString = function(queryString) {
  const matchWords = [];
  const notMatchWords = [];
  const phraseWords = [];
  const notPhraseWords = [];
  const prefixPaths = [];
  const notPrefixPaths = [];
  const tags = [];

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

    // https://regex101.com/r/lN4LIV/1
    const matchNegative = word.match(/^-(prefix:)?(.+)$/);
    // https://regex101.com/r/gVssZe/1
    const matchPositive = word.match(/^(prefix:)?(.+)$/);

    if (matchNegative != null) {
      const isPrefixCondition = (matchNegative[1] != null);
      if (isPrefixCondition) {
        notPrefixPaths.push(matchNegative[2]);
      }
      else {
        notMatchWords.push(matchNegative[2]);
      }
    }
    else if (matchPositive != null) {
      const isPrefixCondition = (matchPositive[1] != null);
      if (isPrefixCondition) {
        prefixPaths.push(matchPositive[2]);
      }
      else {
        matchWords.push(matchPositive[2]);
      }
    }

    const matchTag = word.match(/^(tag:)?(.+)$/);
    if (matchTag != null) {
      const isTagCondition = (matchTag[1] != null);
      if (isTagCondition) {
        tags.push(matchTag[2]);
      }
      else {
        matchWords.push(matchTag[2]);
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
    tags,
  };
};

SearchClient.prototype.syncPageCreated = function(page, user, bookmarkCount = 0) {
  debug('SearchClient.syncPageCreated', page.path);

  if (!this.shouldIndexed(page)) {
    return;
  }

  page.bookmarkCount = bookmarkCount;
  this.addPages([page])
    .then((res) => {
      debug('ES Response', res);
    })
    .catch((err) => {
      logger.error('ES Error', err);
    });
};

SearchClient.prototype.syncPageUpdated = function(page, user, bookmarkCount = 0) {
  debug('SearchClient.syncPageUpdated', page.path);
  // TODO delete
  if (!this.shouldIndexed(page)) {
    this.deletePages([page])
      .then((res) => {
        debug('deletePages: ES Response', res);
      })
      .catch((err) => {
        logger.error('deletePages:ES Error', err);
      });

    return;
  }

  page.bookmarkCount = bookmarkCount;
  this.updatePages([page])
    .then((res) => {
      debug('ES Response', res);
    })
    .catch((err) => {
      logger.error('ES Error', err);
    });
};

SearchClient.prototype.syncPageDeleted = function(page, user) {
  debug('SearchClient.syncPageDeleted', page.path);

  this.deletePages([page])
    .then((res) => {
      debug('deletePages: ES Response', res);
    })
    .catch((err) => {
      logger.error('deletePages:ES Error', err);
    });
};

SearchClient.prototype.syncBookmarkChanged = async function(pageId) {
  const Page = this.crowi.model('Page');
  const Bookmark = this.crowi.model('Bookmark');
  const page = await Page.findById(pageId);
  const bookmarkCount = await Bookmark.countByPageId(pageId);

  page.bookmarkCount = bookmarkCount;
  this.updatePages([page])
    .then((res) => { return debug('ES Response', res) })
    .catch((err) => { return logger.error('ES Error', err) });
};

module.exports = SearchClient;
