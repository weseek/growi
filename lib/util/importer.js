/**
 * importer
 */
module.exports = crowi => {
  'use strict';

  const debug = require('debug')('growi:lib:importer');
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
    debug('esa client is initialized');
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.importPagesFromEsa = user => {
    return new Promise(async(resolve, reject) => {
      const rawData = await getAllDataFromEsa();
      const data = convertEsaDataForGrowi(rawData, user);
      const result = await createGrowiPages(data, user);

      resolve(result);
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
   * Convert data into usable format for createGrowiPagesFromImports
   */
  const convertEsaDataForGrowi = (rawData, user) => {
    const basePage = '';
    const data = rawData.body.posts.map(post => {
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

  // initialize when server starts
  importer.initialize();

  return importer;
};
