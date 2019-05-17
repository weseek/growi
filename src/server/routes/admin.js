/* eslint-disable no-use-before-define */
module.exports = function(crowi, app) {
  const debug = require('debug')('growi:routes:admin');
  const logger = require('@alias/logger')('growi:routes:admin');

  const models = crowi.models;
  const Page = models.Page;
  const User = models.User;
  const ExternalAccount = models.ExternalAccount;
  const UserGroup = models.UserGroup;
  const UserGroupRelation = models.UserGroupRelation;
  const Config = models.Config;
  const GlobalNotificationSetting = models.GlobalNotificationSetting;
  const GlobalNotificationMailSetting = models.GlobalNotificationMailSetting;
  const GlobalNotificationSlackSetting = models.GlobalNotificationSlackSetting; // eslint-disable-line no-unused-vars

  const recommendedWhitelist = require('@commons/service/xss/recommended-whitelist');
  const PluginUtils = require('../plugins/plugin-utils');
  const ApiResponse = require('../util/apiResponse');
  const importer = require('../util/importer')(crowi);

  const searchEvent = crowi.event('search');
  const pluginUtils = new PluginUtils();

  const MAX_PAGE_LIST = 50;
  const actions = {};


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
    const settingForm = Config.setupConfigFormData('crowi', req.config);

    return res.render('admin/app', {
      settingForm,
    });
  };

  actions.app.settingUpdate = function(req, res) {
  };

  // app.get('/admin/security'                  , admin.security.index);
  actions.security = {};
  actions.security.index = function(req, res) {
    const settingForm = Config.setupConfigFormData('crowi', req.config);
    const isAclEnabled = !Config.isPublicWikiOnly(req.config);
    return res.render('admin/security', { settingForm, isAclEnabled });
  };

  // app.get('/admin/markdown'                  , admin.markdown.index);
  actions.markdown = {};
  actions.markdown.index = function(req, res) {
    const config = crowi.getConfig();
    const markdownSetting = Config.setupConfigFormData('markdown', config);

    return res.render('admin/markdown', {
      markdownSetting,
      recommendedWhitelist,
    });
  };

  // app.post('/admin/markdown/lineBreaksSetting' , admin.markdown.lineBreaksSetting);
  actions.markdown.lineBreaksSetting = function(req, res) {
    const markdownSetting = req.form.markdownSetting;

    req.session.markdownSetting = markdownSetting;
    if (req.form.isValid) {
      Config.updateNamespaceByArray('markdown', markdownSetting, (err, config) => {
        Config.updateConfigCache('markdown', config);
        req.session.markdownSetting = null;
        req.flash('successMessage', ['Successfully updated!']);
        return res.redirect('/admin/markdown');
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/markdown');
    }
  };

  // app.post('/admin/markdown/presentationSetting' , admin.markdown.presentationSetting);
  actions.markdown.presentationSetting = function(req, res) {
    const presentationSetting = req.form.markdownSetting;

    req.session.markdownSetting = presentationSetting;
    if (req.form.isValid) {
      Config.updateNamespaceByArray('markdown', presentationSetting, (err, config) => {
        Config.updateConfigCache('markdown', config);
        req.session.markdownSetting = null;
        req.flash('successMessage', ['Successfully updated!']);
        return res.redirect('/admin/markdown');
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/markdown');
    }
  };

  // app.post('/admin/markdown/xss-setting' , admin.markdown.xssSetting);
  actions.markdown.xssSetting = function(req, res) {
    const xssSetting = req.form.markdownSetting;

    xssSetting['markdown:xss:tagWhiteList'] = stringToArray(xssSetting['markdown:xss:tagWhiteList']);
    xssSetting['markdown:xss:attrWhiteList'] = stringToArray(xssSetting['markdown:xss:attrWhiteList']);

    req.session.markdownSetting = xssSetting;
    if (req.form.isValid) {
      Config.updateNamespaceByArray('markdown', xssSetting, (err, config) => {
        Config.updateConfigCache('markdown', config);
        req.session.xssSetting = null;
        req.flash('successMessage', ['Successfully updated!']);
        return res.redirect('/admin/markdown');
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/markdown');
    }
  };

  const stringToArray = (string) => {
    const array = string.split(',');
    return array.map((item) => { return item.trim() });
  };

  // app.get('/admin/customize' , admin.customize.index);
  actions.customize = {};
  actions.customize.index = function(req, res) {
    const settingForm = Config.setupConfigFormData('crowi', req.config);

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
    const config = crowi.getConfig();
    const UpdatePost = crowi.model('UpdatePost');
    let slackSetting = Config.setupConfigFormData('notification', config);
    const hasSlackIwhUrl = Config.hasSlackIwhUrl(config);
    const hasSlackToken = Config.hasSlackToken(config);

    if (!Config.hasSlackIwhUrl(req.config)) {
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
  actions.notification.slackSetting = function(req, res) {
    const slackSetting = req.form.slackSetting;

    req.session.slackSetting = slackSetting;
    if (req.form.isValid) {
      Config.updateNamespaceByArray('notification', slackSetting, (err, config) => {
        Config.updateConfigCache('notification', config);
        req.flash('successMessage', ['Successfully Updated!']);
        req.session.slackSetting = null;

        // Re-setup
        crowi.setupSlack().then(() => {
          return res.redirect('/admin/notification');
        });
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/notification');
    }
  };

  // app.get('/admin/notification/slackAuth'     , admin.notification.slackauth);
  actions.notification.slackAuth = function(req, res) {
    const code = req.query.code;

    if (!code || !Config.hasSlackConfig(req.config)) {
      return res.redirect('/admin/notification');
    }

    const slack = crowi.slack;
    slack.getOauthAccessToken(code)
      .then((data) => {
        debug('oauth response', data);
        Config.updateNamespaceByArray('notification', { 'slack:token': data.access_token }, (err, config) => {
          if (err) {
            req.flash('errorMessage', ['Failed to save access_token. Please try again.']);
          }
          else {
            Config.updateConfigCache('notification', config);
            req.flash('successMessage', ['Successfully Connected!']);
          }

          return res.redirect('/admin/notification');
        });
      })
      .catch((err) => {
        debug('oauth response ERROR', err);
        req.flash('errorMessage', ['Failed to fetch access_token. Please do connect again.']);
        return res.redirect('/admin/notification');
      });
  };

  // app.post('/admin/notification/slackIwhSetting' , admin.notification.slackIwhSetting);
  actions.notification.slackIwhSetting = function(req, res) {
    const slackIwhSetting = req.form.slackIwhSetting;

    if (req.form.isValid) {
      Config.updateNamespaceByArray('notification', slackIwhSetting, (err, config) => {
        Config.updateConfigCache('notification', config);
        req.flash('successMessage', ['Successfully Updated!']);

        // Re-setup
        crowi.setupSlack().then(() => {
          return res.redirect('/admin/notification#slack-incoming-webhooks');
        });
      });
    }
    else {
      req.flash('errorMessage', req.form.errors);
      return res.redirect('/admin/notification#slack-incoming-webhooks');
    }
  };

  // app.post('/admin/notification/slackSetting/disconnect' , admin.notification.disconnectFromSlack);
  actions.notification.disconnectFromSlack = function(req, res) {
    Config.updateNamespaceByArray('notification', { 'slack:token': '' }, (err, config) => {
      Config.updateConfigCache('notification', config);
      req.flash('successMessage', ['Successfully Disconnected!']);

      return res.redirect('/admin/notification');
    });
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
      case 'mail':
        setting = new GlobalNotificationMailSetting(crowi);
        setting.toEmail = form.toEmail;
        break;
      // case 'slack':
      //   setting = new GlobalNotificationSlackSetting(crowi);
      //   setting.slackChannels = form.slackChannels;
      //   break;
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
    const setting = await GlobalNotificationSetting.findOne({ _id: form.id });

    switch (form.notifyToType) {
      case 'mail':
        setting.toEmail = form.toEmail;
        break;
      // case 'slack':
      //   setting.slackChannels = form.slackChannels;
      //   break;
      default:
        logger.error('GlobalNotificationSetting Type Error: undefined type');
        req.flash('errorMessage', 'Error occurred in updating the global notification setting: undefined notification type');
        return res.redirect('/admin/notification#global-notification');
    }

    setting.triggerPath = form.triggerPath;
    setting.triggerEvents = getNotificationEvents(form);
    setting.save();

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
    const Config = crowi.model('Config');
    const userUpperLimit = Config.userUpperLimit(crowi);
    const isUserCountExceedsUpperLimit = await User.isUserCountExceedsUpperLimit();

    const page = parseInt(req.query.page) || 1;

    const result = await User.findUsersWithPagination({ page });
    const pager = createPager(result.total, result.limit, result.page, result.pages, MAX_PAGE_LIST);

    return res.render('admin/users', {
      users: result.docs,
      pager,
      activeUsers,
      userUpperLimit,
      isUserCountExceedsUpperLimit,
    });
  };

  actions.user.invite = function(req, res) {
    const form = req.form.inviteForm;
    const toSendEmail = form.sendEmail || false;
    if (req.form.isValid) {
      User.createUsersByInvitation(form.emailList.split('\n'), toSendEmail, (err, userList) => {
        if (err) {
          req.flash('errorMessage', req.form.errors.join('\n'));
        }
        else {
          req.flash('createdUser', userList);
        }
        return res.redirect('/admin/users');
      });
    }
    else {
      req.flash('errorMessage', req.form.errors.join('\n'));
      return res.redirect('/admin/users');
    }
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

  actions.user.remove = function(req, res) {
    const id = req.params.id;
    let username = '';

    return new Promise((resolve, reject) => {
      User.findById(id, (err, userData) => {
        username = userData.username;
        return resolve(userData);
      });
    })
      .then((userData) => {
        return new Promise((resolve, reject) => {
          userData.statusDelete((err, userData) => {
            if (err) {
              reject(err);
            }
            resolve(userData);
          });
        });
      })
      .then((userData) => {
      // remove all External Accounts
        return ExternalAccount.remove({ user: userData }).then(() => { return userData });
      })
      .then((userData) => {
        return Page.removeByPath(`/user/${username}`).then(() => { return userData });
      })
      .then((userData) => {
        req.flash('successMessage', `${username} さんのアカウントを削除しました`);
        return res.redirect('/admin/users');
      })
      .catch((err) => {
        req.flash('errorMessage', '削除に失敗しました。');
        return res.redirect('/admin/users');
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
  actions.user.resetPassword = function(req, res) {
    const id = req.body.user_id;
    const User = crowi.model('User');

    User.resetPasswordByRandomString(id)
      .then((data) => {
        data.user = User.filterToPublicFields(data.user);
        return res.json(ApiResponse.success(data));
      })
      .catch((err) => {
        debug('Error on reseting password', err);
        return res.json(ApiResponse.error('Error'));
      });
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
    const isAclEnabled = !Config.isPublicWikiOnly(req.config);
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
                return resolve([userGroup, relations]);
              });
          });
        });
      })
      .then((allRelationsPromise) => {
        return Promise.all(allRelationsPromise);
      })
      .then((relations) => {
        renderVar.userGroupRelations = new Map(relations);
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
    const renderVar = {
      userGroup: null,
      userGroupRelations: [],
      notRelatedusers: [],
      relatedPages: [],
    };

    const userGroup = await UserGroup.findOne({ _id: userGroupId });

    if (userGroup == null) {
      logger.error('no userGroup is exists. ', userGroupId);
      req.flash('errorMessage', 'グループがありません');
      return res.redirect('/admin/user-groups');
    }
    renderVar.userGroup = userGroup;

    const resolves = await Promise.all([
      // get all user and group relations
      UserGroupRelation.findAllRelationForUserGroup(userGroup),
      // get all not related users for group
      UserGroupRelation.findUserByNotRelatedGroup(userGroup),
      // get all related pages
      Page.find({ grant: Page.GRANT_USER_GROUP, grantedGroup: { $in: [userGroup] } }),
    ]);
    renderVar.userGroupRelations = resolves[0];
    renderVar.notRelatedusers = resolves[1];
    renderVar.relatedPages = resolves[2];

    return res.render('admin/user-group-detail', renderVar);
  };

  // グループの生成
  actions.userGroup.create = function(req, res) {
    const form = req.form.createGroupForm;
    if (req.form.isValid) {
      const userGroupName = crowi.xss.process(form.userGroupName);

      UserGroup.createGroupByName(userGroupName)
        .then((newUserGroup) => {
          req.flash('successMessage', newUserGroup.name);
          req.flash('createdUserGroup', newUserGroup);
          return res.redirect('/admin/user-groups');
        })
        .catch((err) => {
          debug('create userGroup error:', err);
          req.flash('errorMessage', '同じグループ名が既に存在します。');
        });
    }
    else {
      req.flash('errorMessage', req.form.errors.join('\n'));
      return res.redirect('/admin/user-groups');
    }
  };

  //
  actions.userGroup.update = function(req, res) {
    const userGroupId = req.params.userGroupId;
    const name = crowi.xss.process(req.body.name);

    UserGroup.findById(userGroupId)
      .then((userGroupData) => {
        if (userGroupData == null) {
          req.flash('errorMessage', 'グループの検索に失敗しました。');
          return new Promise();
        }

        // 名前存在チェック
        return UserGroup.isRegisterableName(name)
          .then((isRegisterableName) => {
          // 既に存在するグループ名に更新しようとした場合はエラー
            if (!isRegisterableName) {
              req.flash('errorMessage', 'グループ名が既に存在します。');
            }
            else {
              return userGroupData.updateName(name)
                .then(() => {
                  req.flash('successMessage', 'グループ名を更新しました。');
                })
                .catch((err) => {
                  req.flash('errorMessage', 'グループ名の更新に失敗しました。');
                });
            }
          });
      })
      .then(() => {
        return res.redirect(`/admin/user-group-detail/${userGroupId}`);
      });
  };


  // app.post('/_api/admin/user-group/delete' , admin.userGroup.removeCompletely);
  actions.userGroup.removeCompletely = async(req, res) => {
    const { deleteGroupId, actionName, selectedGroupId } = req.body;

    try {
      await UserGroup.removeCompletelyById(deleteGroupId, actionName, selectedGroupId);
      req.flash('successMessage', '削除しました');
    }
    catch (err) {
      debug('Error while removing userGroup.', err, deleteGroupId);
      req.flash('errorMessage', '完全な削除に失敗しました。');
    }

    return res.redirect('/admin/user-groups');
  };

  actions.userGroupRelation = {};
  actions.userGroupRelation.index = function(req, res) {

  };

  actions.userGroupRelation.create = function(req, res) {
    const User = crowi.model('User');
    const UserGroup = crowi.model('UserGroup');
    const UserGroupRelation = crowi.model('UserGroupRelation');

    // req params
    const userName = req.body.user_name;
    const userGroupId = req.body.user_group_id;

    let user = null;
    let userGroup = null;

    Promise.all([
      // ユーザグループをIDで検索
      UserGroup.findById(userGroupId),
      // ユーザを名前で検索
      User.findUserByUsername(userName),
    ])
      .then((resolves) => {
        userGroup = resolves[0];
        user = resolves[1];
        // Relation を作成
        UserGroupRelation.createRelation(userGroup, user);
      })
      .then((result) => {
        return res.redirect(`/admin/user-group-detail/${userGroup.id}`);
      })
      .catch((err) => {
        debug('Error on create user-group relation', err);
        req.flash('errorMessage', 'Error on create user-group relation');
        return res.redirect(`/admin/user-group-detail/${userGroup.id}`);
      });
  };

  actions.userGroupRelation.remove = function(req, res) {
    const UserGroupRelation = crowi.model('UserGroupRelation');
    const userGroupId = req.params.id;
    const relationId = req.params.relationId;

    UserGroupRelation.removeById(relationId)
      .then(() => {
        return res.redirect(`/admin/user-group-detail/${userGroupId}`);
      })
      .catch((err) => {
        debug('Error on remove user-group-relation', err);
        req.flash('errorMessage', 'グループのユーザ削除に失敗しました。');
      });
  };

  // Importer management
  actions.importer = {};
  actions.importer.index = function(req, res) {
    const settingForm = Config.setupConfigFormData('crowi', req.config);

    return res.render('admin/importer', {
      settingForm,
    });
  };

  actions.api = {};
  actions.api.appSetting = function(req, res) {
    const form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);

      // mail setting ならここで validation
      if (form['mail:from']) {
        validateMailSetting(req, form, (err, data) => {
          debug('Error validate mail setting: ', err, data);
          if (err) {
            req.form.errors.push('SMTPを利用したテストメール送信に失敗しました。設定をみなおしてください。');
            return res.json({ status: false, message: req.form.errors.join('\n') });
          }

          return saveSetting(req, res, form);
        });
      }
      else {
        return saveSetting(req, res, form);
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
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', form);
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
    const config = crowi.getConfig();
    const isPublicWikiOnly = Config.isPublicWikiOnly(config);
    if (isPublicWikiOnly) {
      const basicName = form['security:basicName'];
      const basicSecret = form['security:basicSecret'];
      if (basicName !== '' || basicSecret !== '') {
        req.form.errors.push('Public Wikiのため、Basic認証は利用できません。');
        return res.json({ status: false, message: req.form.errors.join('\n') });
      }
      const guestMode = form['security:restrictGuestMode'];
      if (guestMode === 'Deny') {
        req.form.errors.push('Private Wikiへの設定変更はできません。');
        return res.json({ status: false, message: req.form.errors.join('\n') });
      }
    }

    try {
      await crowi.configManager.updateConfigsInTheSameNamespace('crowi', form);
      return res.json({ status: true });
    }
    catch (err) {
      logger.error(err);
      return res.json({ status: false });
    }
  };

  actions.api.securityPassportLdapSetting = function(req, res) {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    return saveSettingAsync(form)
      .then(() => {
        const config = crowi.getConfig();

        // reset strategy
        crowi.passportService.resetLdapStrategy();
        // setup strategy
        if (Config.isEnabledPassportLdap(config)) {
          crowi.passportService.setupLdapStrategy(true);
        }
        return;
      })
      .then(() => {
        res.json({ status: true });
      });
  };

  actions.api.securityPassportSamlSetting = async(req, res) => {
    const form = req.form.settingForm;

    validateSamlSettingForm(req.form, req.t);

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await crowi.configManager.updateConfigsInTheSameNamespace('crowi', form);

    // reset strategy
    await crowi.passportService.resetSamlStrategy();
    // setup strategy
    if (crowi.configManager.getConfig('crowi', 'security:passport-saml:isEnabled')) {
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

  actions.api.securityPassportGoogleSetting = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    debug('form content', form);
    await saveSettingAsync(form);
    const config = await crowi.getConfig();

    // reset strategy
    await crowi.passportService.resetGoogleStrategy();
    // setup strategy
    if (Config.isEnabledPassportGoogle(config)) {
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
    await saveSettingAsync(form);
    const config = await crowi.getConfig();

    // reset strategy
    await crowi.passportService.resetGitHubStrategy();
    // setup strategy
    if (Config.isEnabledPassportGitHub(config)) {
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
    await saveSettingAsync(form);
    const config = await crowi.getConfig();


    // reset strategy
    await crowi.passportService.resetTwitterStrategy();
    // setup strategy
    if (Config.isEnabledPassportTwitter(config)) {
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
  actions.api.customizeSetting = function(req, res) {
    const form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);
      return saveSetting(req, res, form);
    }

    return res.json({ status: false, message: req.form.errors.join('\n') });
  };

  actions.api.customizeSetting = function(req, res) {
    const form = req.form.settingForm;

    if (req.form.isValid) {
      debug('form content', form);
      return saveSetting(req, res, form);
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
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    await saveSetting(req, res, form);
    await importer.initializeEsaClient();
  };

  /**
   * save qiita settings, update config cache, and response json
   *
   * @param {*} req
   * @param {*} res
   */
  actions.api.importerSettingQiita = async(req, res) => {
    const form = req.form.settingForm;

    if (!req.form.isValid) {
      return res.json({ status: false, message: req.form.errors.join('\n') });
    }

    await saveSetting(req, res, form);
    await importer.initializeQiitaClient();
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
      return res.json({ status: false, message: `<br> - ${errors.join('<br> - ')}` });
    }
    return res.json({ status: true });
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
      return res.json({ status: false, message: `<br> - ${errors.join('<br> - ')}` });
    }
    return res.json({ status: true });
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
      return res.json({ status: true });
    }
    catch (err) {
      return res.json({ status: false, message: `${err}` });
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
      return res.json({ status: true });
    }
    catch (err) {
      return res.json({ status: false, message: `${err}` });
    }
  };


  actions.api.searchBuildIndex = async function(req, res) {
    const search = crowi.getSearcher();
    if (!search) {
      return res.json(ApiResponse.error('ElasticSearch Integration is not set up.'));
    }

    // first, delete index
    try {
      await search.deleteIndex();
    }
    catch (err) {
      logger.warn('Delete index Error, but if it is initialize, its ok.', err);
    }

    // second, create index
    try {
      await search.buildIndex();
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error(err));
    }

    searchEvent.on('addPageProgress', (total, current, skip) => {
      crowi.getIo().sockets.emit('admin:addPageProgress', { total, current, skip });
    });
    searchEvent.on('finishAddPage', (total, current, skip) => {
      crowi.getIo().sockets.emit('admin:finishAddPage', { total, current, skip });
    });
    // add all page
    search
      .addAllPages()
      .then(() => {
        debug('Data is successfully indexed. ------------------ ✧✧');
      })
      .catch((err) => {
        logger.error('Error', err);
      });

    return res.json(ApiResponse.success());
  };

  actions.api.userGroups = async(req, res) => {
    try {
      const userGroups = await UserGroup.find();
      return res.json(ApiResponse.success({ userGroups }));
    }
    catch (err) {
      logger.error('Error', err);
      return res.json(ApiResponse.error('Error'));
    }
  };

  /**
   * save settings, update config cache, and response json
   *
   * @param {any} req
   * @param {any} res
   * @param {any} form
   */
  function saveSetting(req, res, form) {
    Config.updateNamespaceByArray('crowi', form, (err, config) => {
      Config.updateConfigCache('crowi', config);
      return res.json({ status: true });
    });
  }

  /**
   * save settings, update config cache ONLY. (this method don't response json)
   *
   * @param {any} form
   * @returns
   */
  function saveSettingAsync(form) {
    return new Promise((resolve, reject) => {
      Config.updateNamespaceByArray('crowi', form, (err, config) => {
        if (err) {
          return reject(err);
        }

        Config.updateConfigCache('crowi', config);
        return resolve();
      });
    });
  }

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
      if (crowi.configManager.getConfigFromEnvVars('crowi', key) === null && formValue === '') {
        const formItemName = t(`security_setting.form_item_name.${key}`);
        form.errors.push(t('form_validation.required', formItemName));
      }
    }
  }

  return actions;
};
