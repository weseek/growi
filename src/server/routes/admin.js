/* eslint-disable no-use-before-define */
module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:admin');
  const logger = require('@alias/logger')('growi:routes:admin');

  const models = crowi.models;
  const User = models.User;
  const ExternalAccount = models.ExternalAccount;
  const UserGroup = models.UserGroup;
  const UserGroupRelation = models.UserGroupRelation;
  const GlobalNotificationSetting = models.GlobalNotificationSetting;

  const {
    configManager,
    aclService,
    slackNotificationService,
    exportService,
  } = crowi;

  const recommendedWhitelist = require('@commons/service/xss/recommended-whitelist');
  const ApiResponse = require('../util/apiResponse');
  const importer = require('../util/importer')(crowi);

  const searchEvent = crowi.event('search');

  const MAX_PAGE_LIST = 50;
  const actions = {};

  const { check } = require('express-validator/check');

  const api = {};

  function createPager(total, limit, page, pagesCount, maxPageList) {
    const pager = {
      page,
      pagesCount,
      pages: [],
      total,
      previous: null,
      previousDots: false,
      next: null,
      nextDots: false,
    };

    if (page > 1) {
      pager.previous = page - 1;
    }

    if (page < pagesCount) {
      pager.next = page + 1;
    }

    let pagerMin = Math.max(1, Math.ceil(page - maxPageList / 2));
    let pagerMax = Math.min(pagesCount, Math.floor(page + maxPageList / 2));
    if (pagerMin === 1) {
      if (MAX_PAGE_LIST < pagesCount) {
        pagerMax = MAX_PAGE_LIST;
      }
      else {
        pagerMax = pagesCount;
      }
    }
    if (pagerMax === pagesCount) {
      if ((pagerMax - MAX_PAGE_LIST) < 1) {
        pagerMin = 1;
      }
      else {
        pagerMin = pagerMax - MAX_PAGE_LIST;
      }
    }

    pager.previousDots = null;
    if (pagerMin > 1) {
      pager.previousDots = true;
    }

    pager.nextDots = null;
    if (pagerMax < pagesCount) {
      pager.nextDots = true;
    }

    for (let i = pagerMin; i <= pagerMax; i++) {
      pager.pages.push(i);
    }

    return pager;
  }

  // setup websocket event for rebuild index
  searchEvent.on('addPageProgress', (total, current, skip) => {
    crowi.getIo().sockets.emit('admin:addPageProgress', { total, current, skip });
  });
  searchEvent.on('finishAddPage', (total, current, skip) => {
    crowi.getIo().sockets.emit('admin:finishAddPage', { total, current, skip });
  });
  searchEvent.on('rebuildingFailed', (error) => {
    crowi.getIo().sockets.emit('admin:rebuildingFailed', { error: error.message });
  });

  actions.index = function(req, res) {
    return res.render('admin/index');
  };

  // app.get('/admin/app'                  , admin.app.index);
  actions.app = {};
  actions.app.index = function(req, res) {
    return res.render('admin/app');
  };

  actions.app.settingUpdate = function(req, res) {
  };

  // app.get('/admin/security'                  , admin.security.index);
  actions.security = {};
  actions.security.index = function(req, res) {
    const isWikiModeForced = aclService.isWikiModeForced();
    const guestModeValue = aclService.getGuestModeValue();

    return res.render('admin/security', {
      isWikiModeForced,
      guestModeValue,
    });
  };

  // app.get('/admin/markdown'                  , admin.markdown.index);
  actions.markdown = {};
  actions.markdown.index = function(req, res) {
    const markdownSetting = configManager.getConfigByPrefix('markdown', 'markdown:');

    return res.render('admin/markdown', {
      markdownSetting,
      recommendedWhitelist,
    });
  };

  // app.get('/admin/customize' , admin.customize.index);
  actions.customize = {};
  actions.customize.index = function(req, res) {
    const settingForm = configManager.getConfigByPrefix('crowi', 'customize:');

    // TODO delete after apiV3
    /* eslint-disable quote-props, no-multi-spaces */
    const highlightJsCssSelectorOptions = {
      'github':           { name: '[Light] GitHub',         border: false },
      'github-gist':      { name: '[Light] GitHub Gist',    border: true },
      'atom-one-light':   { name: '[Light] Atom One Light', border: true },
      'xcode':            { name: '[Light] Xcode',          border: true },
      'vs':               { name: '[Light] Vs',             border: true },
      'atom-one-dark':    { name: '[Dark] Atom One Dark',   border: false },
      'hybrid':           { name: '[Dark] Hybrid',          border: false },
      'monokai':          { name: '[Dark] Monokai',         border: false },
      'tomorrow-night':   { name: '[Dark] Tomorrow Night',  border: false },
      'vs2015':           { name: '[Dark] Vs 2015',         border: false },
    };
    /* eslint-enable quote-props, no-multi-spaces */

    return res.render('admin/customize', {
      settingForm,
      highlightJsCssSelectorOptions,
    });
  };

  // app.get('/admin/notification'               , admin.notification.index);
  actions.notification = {};
  actions.notification.index = async(req, res) => {

    return res.render('admin/notification');
  };

  // app.get('/admin/notification/slackAuth'     , admin.notification.slackauth);
  actions.notification.slackAuth = function(req, res) {
    const code = req.query.code;

    if (!code || !slackNotificationService.hasSlackConfig()) {
      return res.redirect('/admin/notification');
    }

    const slack = crowi.slack;
    slack.getOauthAccessToken(code)
      .then(async(data) => {
        debug('oauth response', data);

        try {
          await configManager.updateConfigsInTheSameNamespace('notification', { 'slack:token': data.access_token });
          req.flash('successMessage', ['Successfully Connected!']);
        }
        catch (err) {
          req.flash('errorMessage', ['Failed to save access_token. Please try again.']);
        }

        return res.redirect('/admin/notification');
      })
      .catch((err) => {
        debug('oauth response ERROR', err);
        req.flash('errorMessage', ['Failed to fetch access_token. Please do connect again.']);
        return res.redirect('/admin/notification');
      });
  };

  // app.post('/admin/notification/slackSetting/disconnect' , admin.notification.disconnectFromSlack);
  actions.notification.disconnectFromSlack = async function(req, res) {
    await configManager.updateConfigsInTheSameNamespace('notification', { 'slack:token': '' });
    req.flash('successMessage', ['Successfully Disconnected!']);

    return res.redirect('/admin/notification');
  };

  actions.globalNotification = {};
  actions.globalNotification.detail = async(req, res) => {
    const notificationSettingId = req.params.id;
    let globalNotification;

    if (notificationSettingId) {
      try {
        globalNotification = await GlobalNotificationSetting.findOne({ _id: notificationSettingId });
      }
      catch (err) {
        logger.error(`Error in finding a global notification setting with {_id: ${notificationSettingId}}`);
      }
    }

    return res.render('admin/global-notification-detail', { globalNotification });
  };

  actions.search = {};
  actions.search.index = function(req, res) {
    return res.render('admin/search', {});
  };

  actions.user = {};
  actions.user.index = async function(req, res) {
    return res.render('admin/users');
  };

  // これやったときの relation の挙動未確認
  actions.user.removeCompletely = function(req, res) {
    // ユーザーの物理削除
    const id = req.params.id;

    User.removeCompletelyById(id, (err, removed) => {
      if (err) {
        debug('Error while removing user.', err, id);
        req.flash('errorMessage', '完全な削除に失敗しました。');
      }
      else {
        req.flash('successMessage', '削除しました');
      }
      return res.redirect('/admin/users');
    });
  };

  // app.post('/_api/admin/users.resetPassword' , admin.api.usersResetPassword);
  actions.user.resetPassword = async function(req, res) {
    const id = req.body.user_id;
    const User = crowi.model('User');

    try {
      const newPassword = await User.resetPasswordByRandomString(id);

      const user = await User.findById(id);

      const result = { user: user.toObject(), newPassword };
      return res.json(ApiResponse.success(result));
    }
    catch (err) {
      debug('Error on reseting password', err);
      return res.json(ApiResponse.error(err));
    }
  };

  actions.externalAccount = {};
  actions.externalAccount.index = function(req, res) {
    return res.render('admin/external-accounts');
  };

  actions.externalAccount.remove = async function(req, res) {
    const id = req.params.id;

    let account = null;

    try {
      account = await ExternalAccount.findByIdAndRemove(id);
      if (account == null) {
        throw new Error('削除に失敗しました。');
      }
    }
    catch (err) {
      req.flash('errorMessage', err.message);
      return res.redirect('/admin/users/external-accounts');
    }

    req.flash('successMessage', `外部アカウント '${account.providerType}/${account.accountId}' を削除しました`);
    return res.redirect('/admin/users/external-accounts');
  };

  actions.userGroup = {};
  actions.userGroup.index = function(req, res) {
    const page = parseInt(req.query.page) || 1;
    const isAclEnabled = aclService.isAclEnabled();
    const renderVar = {
      userGroups: [],
      userGroupRelations: new Map(),
      pager: null,
      isAclEnabled,
    };

    UserGroup.findUserGroupsWithPagination({ page })
      .then((result) => {
        const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);
        const userGroups = result.docs;
        renderVar.userGroups = userGroups;
        renderVar.pager = pager;
        return userGroups.map((userGroup) => {
          return new Promise((resolve, reject) => {
            UserGroupRelation.findAllRelationForUserGroup(userGroup)
              .then((relations) => {
                return resolve({
                  id: userGroup._id,
                  relatedUsers: relations.map((relation) => {
                    return relation.relatedUser;
                  }),
                });
              });
          });
        });
      })
      .then((allRelationsPromise) => {
        return Promise.all(allRelationsPromise);
      })
      .then((relations) => {
        for (const relation of relations) {
          renderVar.userGroupRelations[relation.id] = relation.relatedUsers;
        }
        debug('in findUserGroupsWithPagination findAllRelationForUserGroupResult', renderVar.userGroupRelations);
        return res.render('admin/user-groups', renderVar);
      })
      .catch((err) => {
        debug('Error on find all relations', err);
        return res.json(ApiResponse.error('Error'));
      });
  };

  // グループ詳細
  actions.userGroup.detail = async function(req, res) {
    const userGroupId = req.params.id;
    const userGroup = await UserGroup.findOne({ _id: userGroupId });

    if (userGroup == null) {
      logger.error('no userGroup is exists. ', userGroupId);
      return res.redirect('/admin/user-groups');
    }

    return res.render('admin/user-group-detail', { userGroup });
  };

  // Importer management
  actions.importer = {};
  actions.importer.api = api;
  api.validators = {};
  api.validators.importer = {};

  actions.importer.index = function(req, res) {
    const settingForm = configManager.getConfigByPrefix('crowi', 'importer:');
    return res.render('admin/importer', {
      settingForm,
    });
  };

  api.validators.importer.esa = function() {
    const validator = [
      check('importer:esa:team_name').not().isEmpty().withMessage('Error. Empty esa:team_name'),
      check('importer:esa:access_token').not().isEmpty().withMessage('Error. Empty esa:access_token'),
    ];
    return validator;
  };

  api.validators.importer.qiita = function() {
    const validator = [
      check('importer:qiita:team_name').not().isEmpty().withMessage('Error. Empty qiita:team_name'),
      check('importer:qiita:access_token').not().isEmpty().withMessage('Error. Empty qiita:access_token'),
    ];
    return validator;
  };


  // Export management
  actions.export = {};
  actions.export.index = (req, res) => {
    return res.render('admin/export');
  };

  actions.export.download = (req, res) => {
    // TODO: add express validator
    const { fileName } = req.params;

    try {
      const zipFile = exportService.getFile(fileName);
      return res.download(zipFile);
    }
    catch (err) {
      // TODO: use ApiV3Error
      logger.error(err);
      return res.json(ApiResponse.error());
    }
  };

  actions.api = {};

  // app.get('/_api/admin/users.search' , admin.api.userSearch);
  actions.api.usersSearch = function(req, res) {
    const User = crowi.model('User');
    const email = req.query.email;

    User.findUsersByPartOfEmail(email, {})
      .then((users) => {
        const result = {
          data: users,
        };
        return res.json(ApiResponse.success(result));
      })
      .catch((err) => {
        return res.json(ApiResponse.error());
      });
  };

  /**
   * save esa settings, update config cache, and response json
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.importerSettingEsa = async(req, res) => {
    const form = req.body;

    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(ApiResponse.error('esa.io form is blank'));
    }

    await configManager.updateConfigsInTheSameNamespace('crowi', form);
    importer.initializeEsaClient(); // let it run in the back aftert res
    return res.json(ApiResponse.success());
  };

  /**
   * save qiita settings, update config cache, and response json
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.importerSettingQiita = async(req, res) => {
    const form = req.body;

    const { validationResult } = require('express-validator');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json(ApiResponse.error('Qiita form is blank'));
    }

    await configManager.updateConfigsInTheSameNamespace('crowi', form);
    importer.initializeQiitaClient(); // let it run in the back aftert res

    return res.json(ApiResponse.success());
  };

  /**
   * Import all posts from esa
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.importDataFromEsa = async(req, res) => {
    const user = req.user;
    let errors;

    try {
      errors = await importer.importDataFromEsa(user);
    }
    catch (err) {
      errors = [err];
    }

    if (errors.length > 0) {
      return res.json(ApiResponse.error(`<br> - ${errors.join('<br> - ')}`));
    }
    return res.json(ApiResponse.success());
  };

  /**
   * Import all posts from qiita
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.importDataFromQiita = async(req, res) => {
    const user = req.user;
    let errors;

    try {
      errors = await importer.importDataFromQiita(user);
    }
    catch (err) {
      errors = [err];
    }

    if (errors.length > 0) {
      return res.json(ApiResponse.error(`<br> - ${errors.join('<br> - ')}`));
    }
    return res.json(ApiResponse.success());
  };

  /**
   * Test connection to esa and response result with json
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.testEsaAPI = async(req, res) => {
    try {
      await importer.testConnectionToEsa();
      return res.json(ApiResponse.success());
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  /**
   * Test connection to qiita and response result with json
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.testQiitaAPI = async(req, res) => {
    try {
      await importer.testConnectionToQiita();
      return res.json(ApiResponse.success());
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };


  actions.api.searchBuildIndex = async function(req, res) {
    const search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('ElasticSearch Integration is not set up.'));
    }

    try {
      search.buildIndex();
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success());
  };

  return actions;
};
