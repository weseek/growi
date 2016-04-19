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

      debug('Prepare', doc);
      self.prepareBodyForCreate(body, doc);
      //debug('Data received: ', doc.path, doc.liker.length, doc.revision.body);
    }).on('error', function (err) {
      debug('Error stream:', err);
      // handle err
    }).on('close', function () {
      // all done
      debug('Close');

      debug('SEnd', body);
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

module.exports = SearchClient;

/*


SearchClient.prototype.deleteIndex = function() {
};
*/

/*
module.exports = function(crowi) {
  var elasticsearch = require('elasticsearch'),
    debug = require('debug')('crowi:lib:search'),
    Page = crowi.model('Page'),
    Config = crowi.model('Config'),
    config = crowi.getConfig(),
    TYPE_PAGE = 'page',
    SLOW_INTERVAL = 200, // 200ms interval.
    lib = {};

  // TODO: configurable
  var host = '127.0.0.1:9200';
  var index_name = 'crowi';
  var default_mapping_file = crowi.resourceDir + 'search/mappings.json';

  var client = new elasticsearch.Client({
    host: host,
  });


  lib.deleteIndex = function() {
    return client.indices.delete({
      index: index_name
    });
  };

  lib.buildIndex = function() {
    return client.indices.create({
      index: index_name,
      body: require(default_mapping_file)
    });
  };

  lib.rebuildIndex = function() {
    var self = this;

    return self.deleteIndex()
    .then(function(data) {
      return self.buildIndex();
    });
  };

  lib.addAllPages = function() {
    var offset = 0;
    var stream = Page.getStreamOfFindAll();
    var self = this;

    stream.on('data', function (doc) {
      if (!doc.creator || !doc.revision) {
        debug('Skipped', doc.path);
        return ;
      }

      var likeCount = doc.liker.length;
      var bookmarkCount = 0; // TODO
      var updated = doc.updatedAt; // TODO

      self.addPage(doc._id.toString(), doc.path, doc.revision.body, doc.creator.username, likeCount, bookmarkCount, updated, true)
      .then(function(data) {
        debug('Page Added', data);
      }).catch(function (err) {
        debug('Error addPage:', err);
      });

      //debug('Data received: ', doc.path, doc.liker.length, doc.revision.body);
    }).on('error', function (err) {
      debug('Error stream:', err);
      // handle err
    }).on('close', function () {
      debug('Close');
      // all done
    });
  };

  lib.addPage = function(id, path, body, creator, likeCount, bookmarkCount, updated, is_public) {
    var self = this;

    return client.create({
      index: index_name,
      type: 'page',
      id: id,
      body: {
        path: path,
        body: body,
        creator: creator,
        likeCount: likeCount,
        bookmarkCount: bookmarkCount,
        is_public: is_public,
        updated: updated,
      }
    });

  };

  lib.updatePage = function(id, path, body, creator, likeCount, bookmarkCount, updated, is_public) {
  };

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

  lib.searchPageByLikeCount = function() {
  };

  return lib;
};

*/
