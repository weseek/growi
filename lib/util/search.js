/**
 * Search
 */

var elasticsearch = require('elasticsearch'),
  debug = require('debug')('crowi:lib:search');

function SearchClient(crowi, esUri) {
  this.esUri = esUri;
  this.crowi = crowi;

  var uri = this.parseUri(this.esUri);
  this.host = uri.host;
  this.index_name = uri.index_name;

  this.client = new elasticsearch.Client({
    host: this.host,
  });

  this.mappingFile = crowi.resourceDir + 'search/mappings.json';
  //this.Page = crowi.model('Page');
  //this.Config = crowi.model('Config');
  //this.config = crowi.getConfig();
}

SearchClient.prototype.parseUri = function(uri) {
  if (!(m = uri.match(/^elasticsearch:\/\/([^:]+):([^\/]+)\/(.+)$/))) {
    throw new Error('Invalid ELASTICSEARCH_URI format. Should be elasticsearch://host:port/index_name');
  }

  return {
    host: m[1] + ':' + m[2],
    index_name: m[3],
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
    path: page.path,
    body: page.revision.body,
    username: page.creator.username,
    comment_count: page.commentCount,
    like_count: page.liker.length || 0,
    updated_at: page.updatedAt,
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
    like_count: page.liker.length || 0,
    created_at: page.createdAt,
    updated_at: page.updatedAt,
  };

  body.push(command);
  body.push(document);
};

SearchClient.prototype.addPages = function(pages)
{
  var self = this;
  var body = [];

  pages.map(function(page) {
    self.prepareBodyForCreate(body, page);
  });

  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.updatePages = function(pages)
{
  var self = this;
  var body = [];

  pages.map(function(page) {
    self.prepareBodyForUpdate(body, page);
  });

  return this.client.bulk({
    body: body,
  });
};

SearchClient.prototype.addAllPages = function()
{
  var self = this;
  var offset = 0;
  var Page = this.crowi.model('Page');
  var stream = Page.getStreamOfFindAll();
  var body = [];

  return new Promise(function(resolve, reject) {
    stream.on('data', function (doc) {
      if (!doc.creator || !doc.revision) {
        debug('Skipped', doc.path);
        return ;
      }

      self.prepareBodyForCreate(body, doc);
    }).on('error', function (err) {
      // TODO: handle err
      debug('Error stream:', err);
    }).on('close', function () {
      // all done

      // 最後に送信
      self.client.bulk({ body: body, })
      .then(function(res) {
        debug('Reponse from es:', res);
        return resolve(res);
      }).catch(function(err) {
        debug('Err from es:', err);
        return reject(err);
      });
    });
  });
};

SearchClient.prototype.createSearchQuerySortedByUpdatedAt = function()
{
  // default is only id field, sorted by updated_at
  return {
    index: this.index_name,
    type: 'pages',
    body: {
      fields: ['_id'],
      sort: [{ updated_at: { order: 'desc'}}],
      query: {}, // query
    }
  };
};

SearchClient.prototype.createSearchQuerySortedByScore = function()
{
  // sort by score
  return {
    index: this.index_name,
    type: 'pages',
    body: {
      fields: ['_id'],
      sort: [ {_score: { order: 'desc'} }],
      query: {}, // query
    }
  };
};

SearchClient.prototype.searchSuggest = function(keyword)
{
  var query = this.createSearchQuerySortedByScore();

  query.body.query = {
    bool: {
      must: [
        {
          bool: {
            should: [
              {
                match: {
                  'path.raw': {
                    query: sprintf('*%s*', keyword),
                    operator: 'or'
                  }
                }
              },
              {
                match: {
                  'body.ja': {
                    query: keyword,
                    operator: 'or'
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };

  return this.client.search(query);
};

SearchClient.prototype.searchKeyword = function(keyword)
{
  var query = this.createSearchQuerySortedByUpdatedAt();

  query.body.query = {
    bool: {
      must: [
        {
          bool: {
            should: [
              {
                match: {
                  'path.raw': {
                    query: sprintf('*%s*', keyword),
                    operator: 'or'
                  }
                }
              },
              {
                match: {
                  'body.ja': {
                    query: keyword,
                    operator: 'or'
                  }
                }
              }
            ]
          }
        }
      ]
    }
  };

  return this.client.search(query);
};

SearchClient.prototype.searchByPath = function(keyword, prefix)
{
  var query = this.createSearchQuerySortedByUpdatedAt();
};

SearchClient.prototype.searchKeywordUnderPath = function(keyword, path)
{
  var query = this.createSearchQuerySortedByUpdatedAt();
};

module.exports = SearchClient;

/*

  lib.searchPageByKeyword = function(keyword) {
    var queryBody = {
       query: {
        bool: {
          should: [
            {term: { path: { term: keyword, boost: 2.0 } }},
            {term: { body: { term: keyword } }}
          ]
        }
      },
      highlight : { fields : { body : {} } },
      //sort: [{ updated: { order: "desc" } } ]
    };
    return client.search({
      index: index_name,
      body: queryBody
    });

  };

*/
