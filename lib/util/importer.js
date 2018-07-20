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
   * Import page data from esa to GROWI
   */
  importer.importPagesFromEsa = user => {
    return new Promise(async(resolve, reject) => {
      const data = await getAllDataFromEsa();
      try {
        await createGrowiPages(data.body.posts, user);
        resolve();
      }
      catch (err) {
        debug(err);
        reject(err);
      }
    });
  };

  /**
   * Get posts from esa (Promise wrapper)
   */
  const getAllDataFromEsa = () => {
    return new Promise((resolve, reject) => {
      esaClient.api.posts((err, res) => {
        if (err) {
          debug(err);
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  /**
   * Create posts from imported data
   */
  const createGrowiPages = (pages, user) => {
    return new Promise((resolve, reject) => {
      const basePage = '/';
      const ignoreNotFound = true;
      pages.forEach(post => {
        const pagePath = basePage + [post.category, post.name].filter(v => v).join('/');
        Page.findPage(pagePath, user, null, ignoreNotFound)
        .then(data => {
          if (data !== null) {
            return reject('Page exists');
          }
          if (!Page.isCreatableName(pagePath)) {
            return reject(`Page name '${pagePath}' is not allowed in Growi`);
          }
          return Page.create(pagePath, post.body_md, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
        })
        .then(createdPage => {
          if (!createdPage) {
            return reject('Page exists');
          }
          debug('Crete page: ' + createdPage);
          resolve();
        })
        .catch(err => {
          debug(err);
          return reject(err);
        });
      });
    });
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.testConnectionToEsa = () => {
    return new Promise(async(resolve, reject) => {
      try {
        await getTeamNameFromEsa();
        resolve();
      }
      catch (err) {
        debug(err);
        reject(err);
      }
    });
  };

  /**
   * Get teams from esa (Promise wrapper)
   */
  const getTeamNameFromEsa = () => {
    return new Promise((resolve, reject) => {
      esaClient.api.team((err, res) => {
        if (err) {
          debug(err);
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  importer.initialize();

  return importer;
};
