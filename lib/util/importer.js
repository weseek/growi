/**
 * importer
 */
module.exports = crowi => {
  'use strict';

  const debug = require('debug')('growi:lib:importer');
  const request = require('request');
  const esa = require('esa-nodejs');
  const Page = crowi.model('Page');
  const User = crowi.model('User');
  const pageRouter = require('../routes/page')(crowi);
  const config = crowi.getConfig();
  let importer = {};
  let esaClient = {};

  /**
   * Get teams from esa (Promise wrapper)
   */
  const getTeamsFromEsa = () => {
    return new Promise((resolve, reject) => {
      esaClient.api.team((err, res) => {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      });
    });
  };

  /**
   * Get posts from esa (Promise wrapper)
   */
  const getPostsFromEsa = () => {
    return new Promise((resolve, reject) => {
      esaClient.api.posts((err, res) => {
        if (err) {
          debug(err);
          reject(err);
        }
        resolve(res);
      });
    });
  };

  /**
   * Initialize importer
   */
  importer.initialize = () => {
    esaClient = esa({
      team:        config.crowi['importer:esa:team_name'],
      accessToken: config.crowi['importer:esa:access_token'],
    });
    debug('esa client is initialized');
  };

  /**
   * Import post data from esa to GROWI
   */
  importer.importAllPostsFromEsa = user => {
    /* Get posts from esa */
    return new Promise((resolve, reject) => {
      getPostsFromEsa()
      .then(res => {
        /* Import to GROWI */
        const basePage = '/';
        const ignoreNotFound = true;
        res.body.posts.forEach(post => {
          const pagePath = basePage + [post.category, post.name].filter(v => v).join('/');
          Page.findPage(pagePath, user, null, ignoreNotFound)
          .then(data => {
            if (data !== null) {
              reject('Page exists');
            }
            return Page.create(pagePath, post.body_md, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
          })
          .then(createdPage => {
            if (!createdPage) {
              reject('Page exists');
            }
            debug('Crete page: ' + createdPage);
            resolve();
          })
          .catch(err => {
            debug(err);
            reject(err);
          });
        });
      })
      .catch(err => {
        debug(err);
        reject(err);
      });
    });
  };

  /**
   * Import post data from esa to GROWI
   */
  importer.testConnectionToEsa = () => {
    return new Promise((resolve, reject) => {
      getTeamsFromEsa()
      .then(res => {
        resolve();
      })
      .catch(err => {
        debug(err);
        reject(err);
      });
    });
  };

  importer.initialize();

  return importer;
};
