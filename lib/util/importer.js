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
    const basePage = '/';
    let createdPages = [];
    let rejectedPages = [];
    let errors = [];

    return new Promise((resolve, reject) => {
      const promises = pages.map(page => {
        return new Promise(async(resolve, reject) => {
          const pagePath = basePage + [page.category, page.name].filter(v => v).join('/');
          const isCreatableName = await Page.isCreatableName(pagePath);
          const isPageNameTaken = await Page.findPage(pagePath, user, null, true);

          if (isCreatableName && !isPageNameTaken) {
            await Page.create(pagePath, page.body_md, user, { grant: Page.GRANT_PUBLIC, grantUserGroupId: null });
            createdPages.push(page);
          }
          else {
            rejectedPages.push(page);
            if (!isCreatableName) {
              errors.push(new Error(`${pagePath} is not a creatable name in Growi`));
            }
            if (isPageNameTaken) {
              errors.push(new Error(`${pagePath} already exists in Growi`));
            }
          }

          resolve();
        });
      });

      Promise.all(promises)
      .then(() => {
        resolve({
          createdPages,
          rejectedPages,
          errors,
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
