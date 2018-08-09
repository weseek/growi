/**
 * Search
 */

var elasticsearch = require('elasticsearch'),
  debug = require('debug')('growi:lib:search');

function SearchClient(crowi, esUri) {
  this.DEFAULT_OFFSET = 0;
  this.DEFAULT_LIMIT = 50;

  this.esUri = esUri;
  this.crowi = crowi;

  var uri = this.parseUri(this.esUri);
  this.host = uri.host;
  this.index_name = uri.index_name;

  this.client = new elasticsearch.Client({
    host: this.host,
    requestTimeout: 5000,
    //log: 'debug',
  });

  this.registerUpdateEvent();

  this.mappingFile = crowi.resourceDir + 'search/mappings.json';
}

SearchClient.prototype.checkESVersion = function() {
  // TODO
};

SearchClient.prototype.registerUpdateEvent = function() {
  var pageEvent = this.crowi.event('page');
  pageEvent.on('create', this.syncPageCreated.bind(this));
  pageEvent.on('update', this.syncPageUpdated.bind(this));
  pageEvent.on('delete', this.syncPageDeleted.bind(this));
};

SearchClient.prototype.shouldIndexed = function(page) {
  // FIXME: Magic Number
  if (page.grant !== 1) {
    return false;
  }

  if (page.redirectTo !== null) {
    return false;
  }

  if (page.isDeleted()) {
    return false;
  }

  return true;
};


// BONSAI_URL is following format:
// => https://{ID}:{PASSWORD}@{HOST}
SearchClient.prototype.parseUri = function(uri) {
  var index_name = 'crowi';
  var host = uri;
  if (m = uri.match(/^(https?:\/\/[^\/]+)\/(.+)$/)) {
    host = m[1];
    index_name = m[2];
  }

  return {
    host,
    index_name,
  };
};

SearchClient.prototype.buildIndex = function(uri) {
  return this.client.indices.create({
    index: this.index_name,
    body: require(this.mappingFile)
  });
};

SearchClient.prototype.deleteIndex = function(uri) {
  return this.client.indices.delete({
    index: this.index_name,
  });
};

SearchClient.prototype.prepareBodyForUpdate = function(body, page) {
  if (!Array.isArray(body)) {
    throw new Error('Body must be an array.');
  }

  var command = {
    update: {
      _index: this.index_name,
      _type: 'pages',
      _id: page._id.toString(),
    }
  };

  var document = {
    doc: {
      path: page.path,
      body: page.revision.body,
      comment_count: page.commentCount,
      bookmark_count: 0, // todo
      like_count: page.liker.length || 0,
      updated_at: page.updatedAt,
    },
    doc_as_upsert: true,
  };

  body.push(command);
  body.push(document);
};

SearchClient.prototype.prepareBodyForCreate = function(body, page) {
  if (!Array.isArray(body)) {
    throw new Error('Body must be an array.');
  }

  var command = {
    index: {
      _index: this.index_name,
      _type: 'pages',
      _id: page._id.toString(),
    }
  };

  var document = {
    path: page.path,
    body: page.revision.body,
    username: page.creator.username,
    comment_count: page.commentCount,
    bookmark_count: 0, // todo
    like_count: page.liker.length || 0,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
  };

  body.push(command);
  body.push(document);
};

SearchClient.prototype.prepareBodyForDelete = function(body, page) {
  if (!Array.isArray(body)) {
    throw new Error('Body must be an array.');
  }

  var command = {
    delete: {
      _index: this.index_name,
      _type: 'pages',
      _id: page._id.toString(),
    }
  };

  body.push(command);
};


SearchClient.prototype.addPages = function(pages) {
  var self = this;
  var body = [];

  pages.map(function(page) {
    self.prepareBodyForCreate(body, page);
  });

  debug('addPages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.updatePages = function(pages) {
  var self = this;
  var body = [];

  pages.map(function(page) {
    self.prepareBodyForUpdate(body, page);
  });

  debug('updatePages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.deletePages = function(pages) {
  var self = this;
  var body = [];

  pages.map(function(page) {
    self.prepareBodyForDelete(body, page);
  });

  debug('deletePages(): Sending Request to ES', body);
  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.addAllPages = function() {
  var self = this;
  var Page = this.crowi.model('Page');
  var cursor = Page.getStreamOfFindAll();
  var body = [];
  var sent = 0;
  var skipped = 0;

  return new Promise(function(resolve, reject) {
    cursor.on('data', function(doc) {
      if (!doc.creator || !doc.revision || !self.shouldIndexed(doc)) {
        //debug('Skipped', doc.path);
        skipped++;
        return ;
      }

      self.prepareBodyForCreate(body, doc);
      //debug(body.length);
      if (body.length > 2000) {
        sent++;
        debug('Sending request (seq, skipped)', sent, skipped);
        self.client.bulk({
          body: body,
          requestTimeout: Infinity,
        }).then(res => {
          debug('addAllPages add anyway (items, errors, took): ', (res.items || []).length, res.errors, res.took);
        }).catch(err => {
          debug('addAllPages error on add anyway: ', err);
        });

        body = [];
      }
    }).on('error', function(err) {
      // TODO: handle err
      debug('Error cursor:', err);
    }).on('close', function() {
      // all done

      // return if body is empty
      // see: https://github.com/weseek/growi/issues/228
      if (body.length == 0) {
        return resolve();
      }

      // 最後にすべてを送信
      self.client.bulk({
        body: body,
        requestTimeout: Infinity,
      })
      .then(function(res) {
        debug('Reponse from es (item length, errros, took):', (res.items || []).length, res.errors, res.took);
        return resolve(res);
      }).catch(function(err) {
        debug('Err from es:', err);
        return reject(err);
      });
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
SearchClient.prototype.search = function(query) {
  var self = this;

  return new Promise(function(resolve, reject) {
    self.client.search(query)
    .then(function(data) {
      var result = {
        meta: {
          took: data.took,
          total: data.hits.total,
          results: data.hits.hits.length,
        },
        data: data.hits.hits.map(function(elm) {
          return {_id: elm._id, _score: elm._score};
        })
      };

      resolve(result);
    }).catch(function(err) {
      reject(err);
    });
  });
};

SearchClient.prototype.createSearchQuerySortedByUpdatedAt = function(option) {
  // getting path by default is almost for debug
  var fields = ['path'];
  if (option) {
    fields = option.fields || fields;
  }

  // default is only id field, sorted by updated_at
  var query = {
    index: this.index_name,
    type: 'pages',
    body: {
      sort: [{ updated_at: { order: 'desc'}}],
      query: {}, // query
      _source: fields,
    }
  };
  this.appendResultSize(query);

  return query;
};

SearchClient.prototype.createSearchQuerySortedByScore = function(option) {
  var fields = ['path'];
  if (option) {
    fields = option.fields || fields;
  }

  // sort by score
  var query = {
    index: this.index_name,
    type: 'pages',
    body: {
      sort: [ {_score: { order: 'desc'} }],
      query: {}, // query
      _source: fields,
    }
  };
  this.appendResultSize(query);

  return query;
};

SearchClient.prototype.appendResultSize = function(query, from, size) {
  query.from = from || this.DEFAULT_OFFSET;
  query.size = size || this.DEFAULT_LIMIT;
};

SearchClient.prototype.appendCriteriaForKeywordContains = function(query, keyword) {
  // query is created by createSearchQuerySortedByScore() or createSearchQuerySortedByUpdatedAt()
  if (!query.body.query.bool) {
    query.body.query.bool = {};
  }
  if (!query.body.query.bool.must || !Array.isArray(query.body.query.must)) {
    query.body.query.bool.must = [];
  }
  if (!query.body.query.bool.must_not || !Array.isArray(query.body.query.must_not)) {
    query.body.query.bool.must_not = [];
  }

  var appendMultiMatchQuery = function(query, type, keywords) {
    var target;
    var operator = 'and';
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
        fields: [
          'path_ja^2',
          'path_en^2',
          'body_ja',
          // "path_en",
          // "body_en",
        ],
        operator: operator,
      }
    });

    return query;
  };

  var parsedKeywords = this.getParsedKeywords(keyword);

  if (parsedKeywords.match.length > 0) {
    query = appendMultiMatchQuery(query, 'match', parsedKeywords.match);
  }

  if (parsedKeywords.not_match.length > 0) {
    query = appendMultiMatchQuery(query, 'not_match', parsedKeywords.not_match);
  }

  if (parsedKeywords.phrase.length > 0) {
    var phraseQueries = [];
    parsedKeywords.phrase.forEach(function(phrase) {
      phraseQueries.push({
        multi_match: {
          query: phrase, // each phrase is quoteted words
          type: 'phrase',
          fields: [ // Not use "*.ja" fields here, because we want to analyze (parse) search words
            'path_raw^2',
            'body_raw',
          ],
        }
      });
    });

    query.body.query.bool.must.push(phraseQueries);
  }

  if (parsedKeywords.not_phrase.length > 0) {
    var notPhraseQueries = [];
    parsedKeywords.not_phrase.forEach(function(phrase) {
      notPhraseQueries.push({
        multi_match: {
          query: phrase, // each phrase is quoteted words
          type: 'phrase',
          fields: [ // Not use "*.ja" fields here, because we want to analyze (parse) search words
            'path_raw^2',
            'body_raw',
          ],
        }
      });
    });

    query.body.query.bool.must_not.push(notPhraseQueries);
  }
};

SearchClient.prototype.appendCriteriaForPathFilter = function(query, path) {
  // query is created by createSearchQuerySortedByScore() or createSearchQuerySortedByUpdatedAt()
  if (!query.body.query.bool) {
    query.body.query.bool = {};
  }

  if (!query.body.query.bool.filter || !Array.isArray(query.body.query.bool.filter)) {
    query.body.query.bool.filter = [];
  }

  if (path.match(/\/$/)) {
    path = path.substr(0, path.length - 1);
  }
  query.body.query.bool.filter.push({
    wildcard: {
      'path': path + '/*'
    }
  });
};

SearchClient.prototype.searchKeyword = function(keyword, option) {
  /* eslint-disable no-unused-vars */
  var from = option.offset || null;
  /* eslint-enable */
  var query = this.createSearchQuerySortedByScore();
  this.appendCriteriaForKeywordContains(query, keyword);

  return this.search(query);
};

SearchClient.prototype.searchByPath = function(keyword, prefix) {
  // TODO path 名だけから検索
};

SearchClient.prototype.searchKeywordUnderPath = function(keyword, path, option) {
  var from = option.offset || null;
  var query = this.createSearchQuerySortedByScore();
  this.appendCriteriaForKeywordContains(query, keyword);
  this.appendCriteriaForPathFilter(query, path);

  if (from) {
    this.appendResultSize(query, from);
  }

  return this.search(query);
};

SearchClient.prototype.getParsedKeywords = function(keyword) {
  var matchWords = [];
  var notMatchWords = [];
  var phraseWords = [];
  var notPhraseWords = [];

  keyword.trim();
  keyword = keyword.replace(/\s+/g, ' ');

  // First: Parse phrase keywords
  var phraseRegExp = new RegExp(/(-?"[^"]+")/g);
  var phrases = keyword.match(phraseRegExp);

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
      notMatchWords.push((RegExp.$1));
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

SearchClient.prototype.syncPageCreated = function(page, user) {
  debug('SearchClient.syncPageCreated', page.path);

  if (!this.shouldIndexed(page)) {
    return ;
  }

  this.addPages([page])
  .then(function(res) {
    debug('ES Response', res);
  })
  .catch(function(err) {
    debug('ES Error', err);
  });
};

SearchClient.prototype.syncPageUpdated = function(page, user) {
  debug('SearchClient.syncPageUpdated', page.path);
  // TODO delete
  if (!this.shouldIndexed(page)) {
    this.deletePages([page])
    .then(function(res) {
      debug('deletePages: ES Response', res);
    })
    .catch(function(err) {
      debug('deletePages:ES Error', err);
    });

    return ;
  }

  this.updatePages([page])
  .then(function(res) {
    debug('ES Response', res);
  })
  .catch(function(err) {
    debug('ES Error', err);
  });
};

SearchClient.prototype.syncPageDeleted = function(page, user) {
  debug('SearchClient.syncPageDeleted', page.path);

  this.deletePages([page])
  .then(function(res) {
    debug('deletePages: ES Response', res);
  })
  .catch(function(err) {
    debug('deletePages:ES Error', err);
  });

  return ;
};

module.exports = SearchClient;
