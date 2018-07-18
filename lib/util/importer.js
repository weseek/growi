/**
 * importer
 */

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:lib:importer')
    , request = require('request')
    , esa = require('esa-nodejs')
    , esaClient = {}
    , qiita = require('./qiitaClient')
    , qiitaClient = {}
    , Page = crowi.model('Page')
    , User = crowi.model('User')
    , pageRouter = require('../routes/page')(crowi)
    , crowi = crowi
    , config = crowi.getConfig()
    , importer = {}
    ;

  /**
   * Initialize importer
   */
  function initialize() {
    esaClient = esa({
      team:        config.crowi['importer:esa:team_name'],
      accessToken: config.crowi['importer:esa:access_token'],
    });
    debug('esa client is initialized');
  }
  /**
   * Get teams from esa (Promise wrapper)
   */
  function getTeamsFromEsa() {
    return new Promise(function(resolve, reject) {
      esaClient.api.team(function(err, res) {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      })
    });
  }

  /**
   * Get posts from esa (Promise wrapper)
   */
  function getPostsFromEsa() {
    return new Promise(function(resolve, reject) {
      esaClient.api.posts(function(err, res) {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      });
    });
  }

  /**
   * Import post data from esa to GROWI
   */
  importer.importAllPostsFromEsa = function(user) {
    /* Get posts from esa */
    return new Promise(function(resolve, reject) {
      getPostsFromEsa()
      .then(function(res) {
        /* Import to GROWI */
        var basePage = '/';
        var ignoreNotFound = true;
        res.body.posts.forEach(function(post) {
          var pagePath = basePage + [post.category, post.name].filter(v => v).join('/')
          Page.findPage(pagePath, user, null, ignoreNotFound)
          .then(function(data) {
            if (data !== null) {
              reject('Page exists');
            }
            return Page.create(pagePath, post.body_md, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
          })
          .then(function(createdPage) {
            if (!createdPage) {
              reject('Page exists');
            }
            debug('Crete page: ' + createdPage);
            resolve();
          })
          .catch(function(err) {
            debug(err);
            reject(err);
          })
        });
      })
      .catch(function(err) {
        debug(err);
        reject(err);
      });
    });
  }

  /**
   * Import post data from esa to GROWI
   */
  importer.testConnectionToEsa = function() {
    return new Promise(function(resolve, reject) {
      getTeamsFromEsa()
      .then(function(res) {
        resolve();
      })
      .catch(function(err) {
        debug(err);
        reject(err);
      });
    });
  }

  initialize();
  importer.esaClient = esaClient;

  return importer;

  /**
   * Initialize importer
   */
  function initialize() {
    qiitaClient = qiita({
      team:        config.crowi['importer:qiita:team_name'],
      accessToken: config.crowi['importer:qiita:access_token'],
    });
    debug('qiita client is initialized');
  }
  /**
   * Get teams from qiita (Promise wrapper)
   */
  function getTeamsFromQiita() {
    return new Promise(function(resolve, reject) {
      qiitaClient.api.team(function(err, res) {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      })
    });
  }

  /**
   * Get posts from qiita (Promise wrapper)
   */
  function getPostsFromQiita() {
    return new Promise(function(resolve, reject) {
      qiitaClient.api.posts(function(err, res) {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      });
    });
  }

  /**
   * Import post data from qiita to GROWI
   */
  importer.importAllPostsFromQiita = function(user) {
    /* Get posts from qiita */
    return new Promise(function(resolve, reject) {
      getPostsFromQiita()
      .then(function(res) {
        /* Import to GROWI */
        var basePage = '/';
        var ignoreNotFound = true;
        res.body.posts.forEach(function(post) {
          var pagePath = basePage + [post.category, post.name].filter(v => v).join('/')
          Page.findPage(pagePath, user, null, ignoreNotFound)
          .then(function(data) {
            if (data !== null) {
              reject('Page exists');
            }
            return Page.create(pagePath, post.body_md, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
          })
          .then(function(createdPage) {
            if (!createdPage) {
              reject('Page exists');
            }
            debug('Crete page: ' + createdPage);
            resolve();
          })
          .catch(function(err) {
            debug(err);
            reject(err);
          })
        });
      })
      .catch(function(err) {
        debug(err);
        reject(err);
      });
    });
  }

  /**
   * Import post data from esa to GROWI
   */
  importer.testConnectionToQiita = function() {
    return new Promise(function(resolve, reject) {
      getTeamsFromQiita()
      .then(function(res) {
        resolve();
      })
      .catch(function(err) {
        debug(err);
        reject(err);
      });
    });
  }

  initialize();
  importer.qiitaClient = qiitaClient;

  return importer;
};
