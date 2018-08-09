/**
 * importer
 */
module.exports = crowi => {
  'use strict';

  const logger = require('@alias/logger')('growi:util:importer');
  const esa = require('esa-nodejs');
  const config = crowi.getConfig();
  const createGrowiPages = require('./createGrowiPagesFromImports')(crowi);
  const restQiitaAPIService = crowi.getRestQiitaAPIService();
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

    restQiitaAPIService.reset();
    logger.info('initialize qiita importer');
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.importDataFromEsa = user => {
    return new Promise((resolve, reject) => {
      const firstPage = 1;
      const errors = importPostsFromEsa(firstPage, user, []);

      resolve(errors);
    });
  };

  /**
   * post page data from esa and create GROWI page
   * @param {string} pageNum default value is '1'
   */
  const importPostsFromEsa = (pageNum, user, errors) => {
    return new Promise((resolve, reject) => {
      esaClient.api.posts({page: pageNum, per_page: 100}, async(err, res) => {
        const nextPage = res.body.next_page;
        const postsReceived = res.body.posts;

        if (err) {
          reject(`error in page ${pageNum}: ${err}`);
        }

        const data = convertEsaDataForGrowi(postsReceived, user);
        const newErrors = await createGrowiPages(data);

        if (nextPage) {
          return resolve(importPostsFromEsa(nextPage, user, errors.concat(newErrors)));
        }

        resolve(errors.concat(newErrors));
      });
    });
  };

  /**
   * Import page data from qiita to GROWI
   */
  importer.importDataFromQiita = async(user) => {
    const firstPage = 1;
    const errors = await importPostsFromQiita(firstPage, user, []);
    return errors;
  };

  /**
   * post page data from qiita and create GROWI page
   * @param {string} pageNum default value is '1'
   */
  const importPostsFromQiita = async(pageNum, user, errors) => {
    const per_page = '100';
    const res = await restQiitaAPIService.getQiitaPages(pageNum, per_page);
    const next = pageNum * per_page;
    const postsReceived = res.pages;
    const pageTotal = res.total;
    const data = convertQiitaDataForGrowi(postsReceived, user);

    const newErrors = await createGrowiPages(data);
    if (next < pageTotal) {
      return importPostsFromQiita(next, user, errors.concat(newErrors));
    }

    return errors.concat(newErrors);
  };

  /**
   * Convert data into usable format for createGrowiPagesFromImports
   */
  const convertEsaDataForGrowi = (pages, user) => {
    const basePage = '';
    const data = pages.map(post => {
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
   * Convert data into usable format for createGrowiPagesFromImports
   */
  const convertQiitaDataForGrowi = (pages, user) => {
    const basePage = '';
    const data = pages.map(post => {
      const title = post.title;
      let path = title;

      return {
        path: `${basePage}/${path}`,
        body: post.body,
        user: user,
      };
    });

    return data;
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.testConnectionToEsa = async() => {
    try {
      await getTeamNameFromEsa();
    }
    catch (err) {
      throw err;
    }
  };

  /**
   * Import page data from qiita to GROWI
   */
  importer.testConnectionToQiita = async() => {
    try {
      await restQiitaAPIService.getQiitaUser();
    }
    catch (err) {
      throw err;
    }
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

  // initialize when server starts
  importer.initialize();

  return importer;
};
