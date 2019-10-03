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
  const GlobalNotificationMailSetting = models.GlobalNotificationMailSetting;
  const GlobalNotificationSlackSetting = models.GlobalNotificationSlackSetting; // eslint-disable-line no-unused-vars

  const {
    configManager,
    aclService,
    slackNotificationService,
    customizeService,
    exportService,
  } = crowi;

  const recommendedWhitelist = require('@commons/service/xss/recommended-whitelist');
  const PluginUtils = require('../plugins/plugin-utils');
  const ApiResponse = require('../util/apiResponse');
  const importer = require('../util/importer')(crowi);

  const searchEvent = crowi.event('search');
  const pluginUtils = new PluginUtils();

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

  actions.index = function(req, res) {
    return res.render('admin/index', {
      plugins: pluginUtils.listPlugins(crowi.rootDir),
    });
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

  // app.post('/admin/markdown/lineBreaksSetting' , admin.markdown.lineBreaksSetting);
  actions.markdown.lineBreaksSetting = async function(req, res) {

    const array = req.body.params;

    try {
      await configManager.updateConfigsInTheSameNamespace('markdown', array);
      return res.json(ApiResponse.success());
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

  };

  // app.post('/admin/markdown/presentationSetting' , admin.markdown.presentationSetting);
  actions.markdown.presentationSetting = async function(req, res) {
    const markdownSetting = req.form.markdownSetting;

    if (req.form.isValid) {
      await configManager.updateConfigsInTheSameNamespace('markdown', markdownSetting);
      req.flash('successMessage', ['Successfully updated!']);
    }
    else {
      req.flash('errorMessage', req.form.errors);
    }

    return res.redirect('/admin/markdown');
  };

  // app.post('/admin/markdown/xss-setting' , admin.markdown.xssSetting);
  actions.markdown.xssSetting = async function(req, res) {
    const xssSetting = req.form.markdownSetting;

    xssSetting['markdown:xss:tagWhiteList'] = csvToArray(xssSetting['markdown:xss:tagWhiteList']);
    xssSetting['markdown:xss:attrWhiteList'] = csvToArray(xssSetting['markdown:xss:attrWhiteList']);

    if (req.form.isValid) {
      await configManager.updateConfigsInTheSameNamespace('markdown', xssSetting);
      req.flash('successMessage', ['Successfully updated!']);
    }
    else {
      req.flash('errorMessage', req.form.errors);
    }

    return res.redirect('/admin/markdown');
  };

  const csvToArray = (string) => {
    const array = string.split(',');
    return array.map((item) => { return item.trim() });
  };

  // app.get('/admin/customize' , admin.customize.index);
  actions.customize = {};
  actions.customize.index = function(req, res) {
    const settingForm = configManager.getConfigByPrefix('crowi', 'customize:');

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
    const UpdatePost = crowi.model('UpdatePost');
    let slackSetting = configManager.getConfigByPrefix('notification', 'slack:');
    const hasSlackIwhUrl = !!configManager.getConfig('notification', 'slack:incomingWebhookUrl');
    const hasSlackToken = !!configManager.getConfig('notification', 'slack:token');

    if (!hasSlackIwhUrl) {
      slackSetting['slack:incomingWebhookUrl'] = '';
    }

    if (req.session.slackSetting) {
      slackSetting = req.session.slackSetting;
      req.session.slackSetting = null;
    }

    const globalNotifications = await GlobalNotificationSetting.findAll();
    const userNotifications = await UpdatePost.findAll();

    return res.render('admin/notification', {
      userNotifications,
      slackSetting,
      hasSlackIwhUrl,
      hasSlackToken,
      globalNotifications,
    });
  };

  // app.post('/admin/notification/slackSetting' , admin.notification.slackauth);
  actions.notification.slackSetting = async function(req, res) {
    const slackSetting = req.form.slackSetting;

    if (req.form.isValid) {
      await configManager.updateConfigsInTheSameNamespace('notification', slackSetting);
      req.flash('successMessage', ['Successfully Updated!']);

      // Re-setup
      crowi.setupSlack().then(() => {
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
    }

    return res.redirect('/admin/notification');
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

  // app.post('/admin/notification/slackIwhSetting' , admin.notification.slackIwhSetting);
  actions.notification.slackIwhSetting = async function(req, res) {
    const slackIwhSetting = req.form.slackIwhSetting;

    if (req.form.isValid) {
      await configManager.updateConfigsInTheSameNamespace('notification', slackIwhSetting);
      req.flash('successMessage', ['Successfully Updated!']);

      // Re-setup
      crowi.setupSlack().then(() => {
        return res.redirect('/admin/notification#slack-incoming-webhooks');
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/notification#slack-incoming-webhooks');
    }
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
    const renderVars = {};

    if (notificationSettingId) {
      try {
        renderVars.setting = await GlobalNotificationSetting.findOne({ _id: notificationSettingId });
      }
      catch (err) {
        logger.error(`Error in finding a global notification setting with {_id: ${notificationSettingId}}`);
      }
    }

    return res.render('admin/global-notification-detail', renderVars);
  };

  actions.globalNotification.create = (req, res) => {
    const form = req.form.notificationGlobal;
    let setting;

    switch (form.notifyToType) {
      case GlobalNotificationSetting.TYPE.MAIL:
        setting = new GlobalNotificationMailSetting(crowi);
        setting.toEmail = form.toEmail;
        break;
      case GlobalNotificationSetting.TYPE.SLACK:
        setting = new GlobalNotificationSlackSetting(crowi);
        setting.slackChannels = form.slackChannels;
        break;
      default:
        logger.error('GlobalNotificationSetting Type Error: undefined type');
        req.flash('errorMessage', 'Error occurred in creating a new global notification setting: undefined notification type');
        return res.redirect('/admin/notification#global-notification');
    }

    setting.triggerPath = form.triggerPath;
    setting.triggerEvents = getNotificationEvents(form);
    setting.save();

    return res.redirect('/admin/notification#global-notification');
  };

  actions.globalNotification.update = async(req, res) => {
    const form = req.form.notificationGlobal;

    const models = {
      [GlobalNotificationSetting.TYPE.MAIL]: GlobalNotificationMailSetting,
      [GlobalNotificationSetting.TYPE.SLACK]: GlobalNotificationSlackSetting,
    };

    let setting = await GlobalNotificationSetting.findOne({ _id: form.id });
    setting = setting.toObject();

    // when switching from one type to another,
    // remove toEmail from slack setting and slackChannels from mail setting
    if (setting.__t !== form.notifyToType) {
      setting = models[setting.__t].hydrate(setting);
      setting.toEmail = undefined;
      setting.slackChannels = undefined;
      await setting.save();
      setting = setting.toObject();
    }

    switch (form.notifyToType) {
      case GlobalNotificationSetting.TYPE.MAIL:
        setting = GlobalNotificationMailSetting.hydrate(setting);
        setting.toEmail = form.toEmail;
        break;
      case GlobalNotificationSetting.TYPE.SLACK:
        setting = GlobalNotificationSlackSetting.hydrate(setting);
        setting.slackChannels = form.slackChannels;
        break;
      default:
        logger.error('GlobalNotificationSetting Type Error: undefined type');
        req.flash('errorMessage', 'Error occurred in updating the global notification setting: undefined notification type');
        return res.redirect('/admin/notification#global-notification');
    }

    setting.__t = form.notifyToType;
    setting.triggerPath = form.triggerPath;
    setting.triggerEvents = getNotificationEvents(form);
    await setting.save();

    return res.redirect('/admin/notification#global-notification');
  };

  actions.globalNotification.remove = async(req, res) => {
    const id = req.params.id;

    try {
      await GlobalNotificationSetting.findOneAndRemove({ _id: id });
      return res.redirect('/admin/notification#global-notification');
    }
    catch (err) {
      req.flash('errorMessage', 'Error in deleting global notification setting');
      return res.redirect('/admin/notification#global-notification');
    }
  };

  const getNotificationEvents = (form) => {
    const triggerEvents = [];
    const triggerEventKeys = Object.keys(form).filter((key) => { return key.match(/^triggerEvent/) });
    triggerEventKeys.forEach((key) => {
      if (form[key]) {
        triggerEvents.push(form[key]);
      }
    });
    return triggerEvents;
  };

  actions.search = {};
  actions.search.index = function(req, res) {
    const search = crowi.getSearcher();
    if (!search) {
      return res.redirect('/admin');
    }

    return res.render('admin/search', {});
  };

  actions.user = {};
  actions.user.index = async function(req, res) {
    const activeUsers = await User.countListByStatus(User.STATUS_ACTIVE);
    const userUpperLimit = aclService.userUpperLimit();
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();

    const page = parseInt(req.query.page) || 1;

    const result = await User.findUsersWithPagination({
      page,
      select: `${User.USER_PUBLIC_FIELDS} lastLoginAt`,
      populate: User.IMAGE_POPULATION,
    });

    const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);

    return res.render('admin/users', {
      users: result.docs,
      pager,
      activeUsers,
      userUpperLimit,
      isUserCountExceedsUpperLimit,
    });
  };

  actions.user.makeAdmin = function(req, res) {
    const id = req.params.id;
    User.findById(id, (err, userData) => {
      userData.makeAdmin((err, userData) => {
        if (err === null) {
          req.flash('successMessage', `${userData.name}さんのアカウントを管理者に設定しました。`);
        }
        else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.removeFromAdmin = function(req, res) {
    const id = req.params.id;
    User.findById(id, (err, userData) => {
      userData.removeFromAdmin((err, userData) => {
        if (err === null) {
          req.flash('successMessage', `${userData.name}さんのアカウントを管理者から外しました。`);
        }
        else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.activate = async function(req, res) {
    // check user upper limit
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();
    if (isUserCountExceedsUpperLimit) {
      req.flash('errorMessage', 'ユーザーが上限に達したため有効化できません。');
      return res.redirect('/admin/users');
    }

    const id = req.params.id;
    User.findById(id, (err, userData) => {
      userData.statusActivate((err, userData) => {
        if (err === null) {
          req.flash('successMessage', `${userData.name}さんのアカウントを有効化しました`);
        }
        else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
  };

  actions.user.suspend = function(req, res) {
    const id = req.params.id;

    User.findById(id, (err, userData) => {
      userData.statusSuspend((err, userData) => {
        if (err === null) {
          req.flash('successMessage', `${userData.name}さんのアカウントを利用停止にしました`);
        }
        else {
          req.flash('errorMessage', '更新に失敗しました。');
          debug(err, userData);
        }
        return res.redirect('/admin/users');
      });
    });
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
    const page = parseInt(req.query.page) || 1;

    ExternalAccount.findAllWithPagination({ page })
      .then((result) => {
        const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);

        return res.render('admin/external-accounts', {
          accounts: result.docs,
          pager,
        });
      });
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
  actions.api.appSetting = async function(req, res) {
    const form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);

      // mail setting ならここで validation
      if (form['mail:from']) {
        validateMailSetting(req, form, async(err, data) => {
          debug('Error validate mail setting: ', err, data);
          if (err) {
            req.form.errors.push('SMTPを利用したテストメール送信に失敗しました。設定をみなおしてください。');
            return res.json({ status: false, message: req.form.errors.join('\n') });
          }

          await configManager.updateConfigsInTheSameNamespace('crowi', form);
          return res.json({ status: true });
        });
      }
      else {
        await configManager.updateConfigsInTheSameNamespace('crowi', form);
        return res.json({ status: true });
      }
    }
    else {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }
  };

  actions.api.asyncAppSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);

    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', form);
      return res.json({ status: true });
    }
    catch (err) {
      logger.error(err);
      return res.json({ status: false });
    }
  };

  actions.api.securitySetting = async function(req, res) {
    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    const form = req.form.settingForm;
    if (aclService.isWikiModeForced()) {
      logger.debug('security:restrictGuestMode will not be changed because wiki mode is forced to set');
      delete form['security:restrictGuestMode'];
    }

    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', form);
      return res.json({ status: true });
    }
    catch (err) {
      logger.error(err);
      return res.json({ status: false });
    }
  };

  actions.api.securityPassportLocalSetting = async function(req, res) {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);

    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', form);
      // reset strategy
      crowi.passportService.resetLocalStrategy();
      // setup strategy
      if (configManager.getConfig('crowi', 'security:passport-local:isEnabled')) {
        crowi.passportService.setupLocalStrategy(true);
      }
    }
    catch (err) {
      logger.error(err);
      return res.json({ status: false, message: err.message });
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportLdapSetting = async function(req, res) {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);

    try {
      await configManager.updateConfigsInTheSameNamespace('crowi', form);
      // reset strategy
      crowi.passportService.resetLdapStrategy();
      // setup strategy
      if (configManager.getConfig('crowi', 'security:passport-ldap:isEnabled')) {
        crowi.passportService.setupLdapStrategy(true);
      }
    }
    catch (err) {
      logger.error(err);
      return res.json({ status: false, message: err.message });
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportSamlSetting = async(req, res) => {
    const form = req.form.settingForm;

    validateSamlSettingForm(req.form, req.t);

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetSamlStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-saml:isEnabled')) {
      try {
        await crowi.passportService.setupSamlStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetSamlStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportBasicSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetBasicStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-basic:isEnabled')) {
      try {
        await crowi.passportService.setupBasicStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetBasicStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportGoogleSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetGoogleStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-google:isEnabled')) {
      try {
        await crowi.passportService.setupGoogleStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetGoogleStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportGitHubSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetGitHubStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-github:isEnabled')) {
      try {
        await crowi.passportService.setupGitHubStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetGitHubStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportTwitterSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetTwitterStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-twitter:isEnabled')) {
      try {
        await crowi.passportService.setupTwitterStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetTwitterStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.securityPassportOidcSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetOidcStrategy();
    // setup strategy
    if (configManager.getConfig('crowi', 'security:passport-oidc:isEnabled')) {
      try {
        await crowi.passportService.setupOidcStrategy(true);
      }
      catch (err) {
        // reset
        await crowi.passportService.resetOidcStrategy();
        return res.json({ status: false, message: err.message });
      }
    }

    return res.json({ status: true });
  };

  actions.api.customizeSetting = async function(req, res) {
    const form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);
      await configManager.updateConfigsInTheSameNamespace('crowi', form);
      customizeService.initCustomCss();
      customizeService.initCustomTitle();

      return res.json({ status: true });
    }

    return res.json({ status: false, message: req.form.errors.join('\n') });
  };

  // app.post('/_api/admin/notifications.add'    , admin.api.notificationAdd);
  actions.api.notificationAdd = function(req, res) {
    const UpdatePost = crowi.model('UpdatePost');
    const pathPattern = req.body.pathPattern;
    const channel = req.body.channel;

    debug('notification.add', pathPattern, channel);
    UpdatePost.create(pathPattern, channel, req.user)
      .then((doc) => {
        debug('Successfully save updatePost', doc);

        // fixme: うーん
        doc.creator = doc.creator._id.toString();
        return res.json(ApiResponse.success({ updatePost: doc }));
      })
      .catch((err) => {
        debug('Failed to save updatePost', err);
        return res.json(ApiResponse.error());
      });
  };

  // app.post('/_api/admin/notifications.remove' , admin.api.notificationRemove);
  actions.api.notificationRemove = function(req, res) {
    const UpdatePost = crowi.model('UpdatePost');
    const id = req.body.id;

    UpdatePost.remove(id)
      .then(() => {
        debug('Successfully remove updatePost');

        return res.json(ApiResponse.success({}));
      })
      .catch((err) => {
        debug('Failed to remove updatePost', err);
        return res.json(ApiResponse.error());
      });
  };

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

  actions.api.toggleIsEnabledForGlobalNotification = async(req, res) => {
    const id = req.query.id;
    const isEnabled = (req.query.isEnabled === 'true');

    try {
      if (isEnabled) {
        await GlobalNotificationSetting.enable(id);
      }
      else {
        await GlobalNotificationSetting.disable(id);
      }

      return res.json(ApiResponse.success());
    }
    catch (err) {
      return res.json(ApiResponse.error());
    }
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
      console.log('validator', errors);
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

    searchEvent.on('addPageProgress', (total, current, skip) => {
      crowi.getIo().sockets.emit('admin:addPageProgress', { total, current, skip });
    });
    searchEvent.on('finishAddPage', (total, current, skip) => {
      crowi.getIo().sockets.emit('admin:finishAddPage', { total, current, skip });
    });

    await search.buildIndex();

    return res.json(ApiResponse.success());
  };

  function validateMailSetting(req, form, callback) {
    const mailer = crowi.mailer;
    const option = {
      host: form['mail:smtpHost'],
      port: form['mail:smtpPort'],
    };
    if (form['mail:smtpUser'] && form['mail:smtpPassword']) {
      option.auth = {
        user: form['mail:smtpUser'],
        pass: form['mail:smtpPassword'],
      };
    }
    if (option.port === 465) {
      option.secure = true;
    }

    const smtpClient = mailer.createSMTPClient(option);
    debug('mailer setup for validate SMTP setting', smtpClient);

    smtpClient.sendMail({
      from: form['mail:from'],
      to: req.user.email,
      subject: 'Wiki管理設定のアップデートによるメール通知',
      text: 'このメールは、WikiのSMTP設定のアップデートにより送信されています。',
    }, callback);
  }

  /**
   * validate setting form values for SAML
   *
   * This validation checks, for the value of each mandatory items,
   * whether it from the environment variables is empty and form value to update it is empty.
   */
  function validateSamlSettingForm(form, t) {
    for (const key of crowi.passportService.mandatoryConfigKeysForSaml) {
      const formValue = form.settingForm[key];
      if (configManager.getConfigFromEnvVars('crowi', key) === null && formValue === '') {
        const formItemName = t(`security_setting.form_item_name.${key}`);
        form.errors.push(t('form_validation.required', formItemName));
      }
    }
  }

  return actions;
};
