/**
 * importer
 */
module.exports = crowi => {
  'use strict';

  const logger = require('@alias/logger')('growi:util:importer');
  const esa = require('esa-nodejs');
  const User = crowi.model('User');
  const config = crowi.getConfig();
  const createGrowiPages = require('./createGrowiPagesFromImports')(crowi);
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
    logger.info('initialize esa importer');
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.importDataFromEsa = user => {
    return new Promise(async(resolve, reject) => {
      const rawData = await getAllPostsFromEsa([], 1);
      const data = convertEsaDataForGrowi(rawData, user);
      const result = await createGrowiPages(data, user);

      resolve(result);
    });
  };

  const getAllPostsFromEsa = (pagesSoFar, pageNum) => {
    return new Promise((resolve, reject) => {
      esaClient.api.posts({page: pageNum, per_page: 100}, (err, res) => {
        const nextPage = res.body.next_page;
        const postsReceived = res.body.posts;

        if (err) {
          reject(`error in page ${pageNum}: ${err}`);
        }

        if (nextPage) {
          return resolve(getAllPostsFromEsa(pagesSoFar.concat(postsReceived), nextPage));
        }
        else {
          return resolve(pagesSoFar.concat(postsReceived));
        }
      });
    });
  };

  /**
   * Convert data into usable format for createGrowiPagesFromImports
   */
  const convertEsaDataForGrowi = (rawData, user) => {
    const basePage = '';
    const data = rawData.map(post => {
      const category = post.category;
      const name = post.name;
      let path = '';

      if (category && name) {
        path = `${category}/${name}`;
      }
      else if (category) {
        path = category;
      }
      else if (name) {
        path = name;
      }

      return {
        path: `${basePage}/${path}`,
        body: post.body_md,
        user: user,
      };
    });

    return data;
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
          return reject(err);
        }
        resolve(res);
      });
    });
  };

  importer.initialize();

  return importer;
};
