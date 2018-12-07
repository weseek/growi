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

  this.mappingFile = crowi.resourceDir + 'search/mappings.json';
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
  let m;
  if ((m = uri.match(/^(https?:\/\/[^/]+)\/(.+)$/))) {
    host = m[1];
    indexName = m[2];
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
    grantedUserIds = page.grantedUsers.map(user => {
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

  let command = {
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

  let command = {
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

  let command = {
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

  for (const page of pages) {
    page.bookmarkCount = await Bookmark.countByPageId(page._id);
    this.prepareBodyForCreate(body, page);
  }

  logger.debug('addPages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.updatePages = function(pages) {
  let self = this;
  let body = [];

  pages.map(function(page) {
    self.prepareBodyForUpdate(body, page);
  });

  logger.debug('updatePages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.deletePages = function(pages) {
  let self = this;
  let body = [];

  pages.map(function(page) {
    self.prepareBodyForDelete(body, page);
  });

  logger.debug('deletePages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
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
    const bulkSend = body => {
      self.client
        .bulk({
          body: body,
          requestTimeout: Infinity,
        })
        .then(res => {
          logger.info('addAllPages add anyway (items, errors, took): ', (res.items || []).length, res.errors, res.took, 'ms');
        })
        .catch(err => {
          logger.error('addAllPages error on add anyway: ', err);
        });
    };

    cursor
      .eachAsync(async doc => {
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
      .catch(e => {
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
SearchClient.prototype.search = async function(query) {
  let self = this;

  // for debug
  if (process.env.NODE_ENV === 'development') {
    const result = await this.client.indices.validateQuery({
      explain: true,
      body: {
        query: query.body.query
      },
    });
    logger.info('ES returns explanations: ', result.explanations);
  }

  return new Promise(function(resolve, reject) {
    self.client
      .search(query)
      .then(function(data) {
        let result = {
          meta: {
            took: data.took,
            total: data.hits.total,
            results: data.hits.hits.length,
          },
          data: data.hits.hits.map(function(elm) {
            return { _id: elm._id, _score: elm._score, _source: elm._source };
          }),
        };

        resolve(result);
      })
      .catch(function(err) {
        logger.error('Search error', err);
        reject(err);
      });
  });
};

SearchClient.prototype.createSearchQuerySortedByUpdatedAt = function(option) {
  // getting path by default is almost for debug
  let fields = ['path', 'bookmark_count'];
  if (option) {
    fields = option.fields || fields;
  }

  // default is only id field, sorted by updated_at
  let query = {
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
  let query = {
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

  const isInitialized = query => !!query && Array.isArray(query);

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

SearchClient.prototype.appendCriteriaForKeywordContains = function(query, keyword) {
  query = this.initializeBoolQuery(query);

  const appendMultiMatchQuery = function(query, type, keywords) {
    let target;
    let operator = 'and';
    switch (type) {
      case 'not_match':
        target = query.body.query.bool.must_not;
        operator = 'or';
        break;
      case 'match':
      default:
        target = query.body.query.bool.must;
    }

    target.push({
      multi_match: {
        query: keywords.join(' '),
        // TODO: By user's i18n setting, change boost or search target fields
        fields: ['path.ja^2', 'path.en^2', 'body.ja', 'body.en'],
        operator: operator,
      },
    });

    return query;
  };

  let parsedKeywords = this.getParsedKeywords(keyword);

  if (parsedKeywords.match.length > 0) {
    query = appendMultiMatchQuery(query, 'match', parsedKeywords.match);
  }

  if (parsedKeywords.not_match.length > 0) {
    query = appendMultiMatchQuery(query, 'not_match', parsedKeywords.not_match);
  }

  if (parsedKeywords.phrase.length > 0) {
    let phraseQueries = [];
    parsedKeywords.phrase.forEach(function(phrase) {
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
    let notPhraseQueries = [];
    parsedKeywords.not_phrase.forEach(function(phrase) {
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
};

SearchClient.prototype.appendCriteriaForPathFilter = function(query, path) {
  query = this.initializeBoolQuery(query);

  if (path.match(/\/$/)) {
    path = path.substr(0, path.length - 1);
  }
  query.body.query.bool.filter.push({
    wildcard: {
      'path.raw': path + '/*',
    },
  });
};

SearchClient.prototype.filterPagesByViewer = function(query, user, userGroups) {
  query = this.initializeBoolQuery(query);

  const Page = this.crowi.model('Page');
  const { GRANT_PUBLIC, GRANT_RESTRICTED, GRANT_SPECIFIED, GRANT_OWNER, GRANT_USER_GROUP } = Page;

  const grantConditions = [
    { term: { grant: GRANT_PUBLIC } },
  ];

  if (user == null) {
    grantConditions.push(
      { term: { grant: GRANT_RESTRICTED } },
      { term: { grant: GRANT_SPECIFIED } },
      { term: { grant: GRANT_OWNER } },
    );
  }
  else {
    grantConditions.push(
      { bool: {
        must: [
          { term: { grant: GRANT_RESTRICTED } },
          { term: { granted_users: user._id.toString() } }
        ]
      } },
      { bool: {
        must: [
          { term: { grant: GRANT_SPECIFIED } },
          { term: { granted_users: user._id.toString() } }
        ]
      } },
      { bool: {
        must: [
          { term: { grant: GRANT_OWNER } },
          { term: { granted_users: user._id.toString() } }
        ]
      } },
    );
  }

  if (userGroups != null && userGroups.length > 0) {
    const userGroupIds = userGroups.map(group => group._id.toString() );
    grantConditions.push(
      { bool: {
        must: [
          { term: { grant: GRANT_USER_GROUP } },
          { terms: { granted_group: userGroupIds } }
        ]
      } },
    );
  }

  query.body.query.bool.filter.push({ bool: { should: grantConditions } });
};

SearchClient.prototype.filterPortalPages = function(query) {
  query = this.initializeBoolQuery(query);

  query.body.query.bool.must_not.push(this.queries.USER);
  query.body.query.bool.filter.push(this.queries.PORTAL);
};

SearchClient.prototype.filterPublicPages = function(query) {
  query = this.initializeBoolQuery(query);

  query.body.query.bool.must_not.push(this.queries.USER);
  query.body.query.bool.filter.push(this.queries.PUBLIC);
};

SearchClient.prototype.filterUserPages = function(query) {
  query = this.initializeBoolQuery(query);

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

SearchClient.prototype.appendFunctionScore = function(query) {
  const User = this.crowi.model('User');
  const count = User.count({}) || 1;
  // newScore = oldScore + log(1 + factor * 'bookmark_count')
  query.body.query = {
    function_score: {
      query: { ...query.body.query },
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

SearchClient.prototype.searchKeyword = function(keyword, user, userGroups, option) {
  const from = option.offset || null;
  const size = option.limit || null;
  const type = option.type || null;
  const query = this.createSearchQuerySortedByScore();
  this.appendCriteriaForKeywordContains(query, keyword);

  // this.filterPagesByType(query, type);
  this.filterPagesByViewer(query, user, userGroups);

  this.appendResultSize(query, from, size);

  this.appendFunctionScore(query);

  return this.search(query);
};

SearchClient.prototype.searchByPath = function(keyword, prefix) {
  // TODO path 名だけから検索
};

SearchClient.prototype.searchKeywordUnderPath = function(keyword, path, user, userGroups, option) {
  const from = option.offset || null;
  const size = option.limit || null;
  const type = option.type || null;
  const query = this.createSearchQuerySortedByScore();
  this.appendCriteriaForKeywordContains(query, keyword);
  this.appendCriteriaForPathFilter(query, path);

  // this.filterPagesByType(query, type);
  this.filterPagesByViewer(query, user, userGroups);

  this.appendResultSize(query, from, size);

  this.appendFunctionScore(query);

  return this.search(query);
};

SearchClient.prototype.getParsedKeywords = function(keyword) {
  let matchWords = [];
  let notMatchWords = [];
  let phraseWords = [];
  let notPhraseWords = [];

  keyword.trim();
  keyword = keyword.replace(/\s+/g, ' ');

  // First: Parse phrase keywords
  let phraseRegExp = new RegExp(/(-?"[^"]+")/g);
  let phrases = keyword.match(phraseRegExp);

  if (phrases !== null) {
    keyword = keyword.replace(phraseRegExp, '');

    phrases.forEach(function(phrase) {
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
  keyword.split(' ').forEach(function(word) {
    if (word === '') {
      return;
    }

    if (word.match(/^-(.+)$/)) {
      notMatchWords.push(RegExp.$1);
    }
    else {
      matchWords.push(word);
    }
  });

  return {
    match: matchWords,
    not_match: notMatchWords,
    phrase: phraseWords,
    not_phrase: notPhraseWords,
  };
};

SearchClient.prototype.syncPageCreated = function(page, user, bookmarkCount = 0) {
  debug('SearchClient.syncPageCreated', page.path);

  if (!this.shouldIndexed(page)) {
    return;
  }

  page.bookmarkCount = bookmarkCount;
  this.addPages([page])
    .then(function(res) {
      debug('ES Response', res);
    })
    .catch(function(err) {
      logger.error('ES Error', err);
    });
};

SearchClient.prototype.syncPageUpdated = function(page, user, bookmarkCount = 0) {
  debug('SearchClient.syncPageUpdated', page.path);
  // TODO delete
  if (!this.shouldIndexed(page)) {
    this.deletePages([page])
      .then(function(res) {
        debug('deletePages: ES Response', res);
      })
      .catch(function(err) {
        logger.error('deletePages:ES Error', err);
      });

    return;
  }

  page.bookmarkCount = bookmarkCount;
  this.updatePages([page])
    .then(function(res) {
      debug('ES Response', res);
    })
    .catch(function(err) {
      logger.error('ES Error', err);
    });
};

SearchClient.prototype.syncPageDeleted = function(page, user) {
  debug('SearchClient.syncPageDeleted', page.path);

  this.deletePages([page])
    .then(function(res) {
      debug('deletePages: ES Response', res);
    })
    .catch(function(err) {
      logger.error('deletePages:ES Error', err);
    });
};

SearchClient.prototype.syncBookmarkChanged = async function(pageId) {
  const Page = this.crowi.model('Page');
  const Bookmark = this.crowi.model('Bookmark');
  const page = await Page.findPageById(pageId);
  const bookmarkCount = await Bookmark.countByPageId(pageId);

  page.bookmarkCount = bookmarkCount;
  this.updatePages([page])
    .then(res => debug('ES Response', res))
    .catch(err => logger.error('ES Error', err));
};

module.exports = SearchClient;
