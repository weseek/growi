/**
 * importer
 */

/* eslint-disable no-use-before-define */

module.exports = (crowi) => {
  const logger = require('@alias/logger')('growi:util:importer');
  const esa = require('esa-nodejs');
  const createGrowiPages = require('./createGrowiPagesFromImports')(crowi);
  const restQiitaAPIService = crowi.getRestQiitaAPIService();

  const configManager = crowi.configManager;
  const getConfig = configManager.getConfig;

  const importer = {};
  let esaClient = {};

  const { check, validationResult } = require('express-validator/check');

  const actions = {};
  const api = {};

  actions.api = api;
  api.validators = {};

  /**
   * Initialize importer
   */
  importer.initializeEsaClient = () => {
    esaClient = esa({
      team:        getConfig('crowi', 'importer:esa:team_name'),
      accessToken: getConfig('crowi', 'importer:esa:access_token'),
    });
    logger.debug('initialize esa importer');
  };

  /**
   * Initialize importer
   */
  importer.initializeQiitaClient = () => {
    restQiitaAPIService.reset();
    logger.debug('initialize qiita importer');
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.importDataFromEsa = (user) => {
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
      esaClient.api.posts({ page: pageNum, per_page: 100 }, async(err, res) => {
        const nextPage = res.body.next_page;
        const postsReceived = res.body.posts;

        if (err) {
          reject(new Error(`error in page ${pageNum}: ${err}`));
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
    const perPage = '100';
    const res = await restQiitaAPIService.getQiitaPages(pageNum, perPage);
    const next = pageNum * perPage;
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
    const data = pages.map((post) => {
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
        user,
      };
    });

    return data;
  };

  /**
   * Convert data into usable format for createGrowiPagesFromImports
   */
  const convertQiitaDataForGrowi = (pages, user) => {
    const basePage = '';
    const data = pages.map((post) => {
      const title = post.title;
      const path = title;

      return {
        path: `${basePage}/${path}`,
        body: post.body,
        user,
      };
    });

    return data;
  };

  /**
   * Import page data from esa to GROWI
   */
  importer.testConnectionToEsa = async() => {
    await getTeamNameFromEsa();
  };

  /**
   * Import page data from qiita to GROWI
   */
  importer.testConnectionToQiita = async() => {
    await restQiitaAPIService.getQiitaUser();
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
  importer.initializeEsaClient();
  importer.initializeQiitaClient();

  api.validators.add = function() {
    const validator = [
      check('esaAccessToken').exists(),
      check('esaTeamName').exists(),
      check('qiitaAccessToken').exists(),
      check('qiitaTeamName').exists(),
    ];
    return validator;
  };

  api.add = async function(req, res) {
    const { validationResult } = require('express-validator/check');

    const errors = validationResult(req.check);
    if (!errors.isEmpty()) {
      // return res.json(ApiResponse.error('Invalid comment.'));
      // return res.status(422).json({ errors: errors.array() });
      return res.json(ApiResponse.error('空欄の項目があります'));
    }
  };

  return importer;
};
