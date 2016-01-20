/**
 * Search
 */


//module.exports = SearchClient;

/*
var elasticsearch = require('elasticsearch'),
  debug = require('debug')('crowi:lib:search'),

function SearchClient(crowi) {
  this.crowi = crowi;
  this.Page = crowi.model('Page');
  this.Config = crowi.model('Config');
  this.config = crowi.getConfig();
}

SearchClient.prototype.deleteIndex = function() {
};
*/

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


  /**
   * @return Promise
   */
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

  /*
     {
     "query": {
     "bool": {
     "should": [
     {"term": {
     "path": {
     "term": "php",
     "boost": 2.0
     }
     }},
     {"term": {
     "body": {
     "term": "php"
     }
     }}
     ]
     }
     },
     "highlight" : {
     "fields" : {
     "body" : {}
     }
     },
     "sort": [
     {
     "updated": {
     "order": "desc"
     }
     }
     ]
     }
     */

  };

  lib.searchPageByLikeCount = function() {
  };

  return lib;
};

