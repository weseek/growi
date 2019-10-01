module.exports = function(crowi, app) {
  const logger = require('@alias/logger')('growi:routes:installer');
  const path = require('path');
  const fs = require('graceful-fs');

  const models = crowi.models;
  const { appService } = crowi;

  const User = models.User;
  const Page = models.Page;

  const actions = {};

  async function initSearchIndex() {
    const search = crowi.getSearcher();
    if (search == null) {
      return;
    }

    await search.deleteIndex();
    await search.buildIndex();
    await search.addAllPages();
  }

  async function createInitialPages(owner, lang) {
    const promises = [];

    // create portal page for '/'
    const welcomeMarkdownPath = path.join(crowi.localeDir, lang, 'welcome.md');
    const welcomeMarkdown = fs.readFileSync(welcomeMarkdownPath);
    promises.push(Page.create('/', welcomeMarkdown, owner, {}));

    // create /Sandbox
    const sandboxMarkdownPath = path.join(crowi.localeDir, lang, 'sandbox.md');
    const sandboxMarkdown = fs.readFileSync(sandboxMarkdownPath);
    promises.push(Page.create('/Sandbox', sandboxMarkdown, owner, {}));

    // create /Sandbox/Bootstrap3
    const bs3MarkdownPath = path.join(crowi.localeDir, 'en-US', 'sandbox-bootstrap3.md');
    const bs3Markdown = fs.readFileSync(bs3MarkdownPath);
    promises.push(Page.create('/Sandbox/Bootstrap3', bs3Markdown, owner, {}));

    await Promise.all(promises);

    try {
      await initSearchIndex();
    }
    catch (err) {
      logger.error('Failed to build Elasticsearch Indices', err);
    }
  }

  actions.index = function(req, res) {
    return res.render('installer');
  };

  actions.install = async function(req, res, next) {
    const registerForm = req.body.registerForm || {};

    if (!req.form.isValid) {
      return res.render('installer');
    }

    const name = registerForm.name;
    const username = registerForm.username;
    const email = registerForm.email;
    const password = registerForm.password;
    const language = registerForm['app:globalLang'] || 'en-US';

    await appService.initDB(language);

    // create first admin user
    let adminUser;
    try {
      adminUser = await User.createUser(name, username, email, password, language);
      await adminUser.asyncMakeAdmin();
    }
    catch (err) {
      req.form.errors.push(`管理ユーザーの作成に失敗しました。${err.message}`);
      return res.render('installer');
    }
    // create initial pages
    await createInitialPages(adminUser, language);
    // init plugins
    crowi.pluginService.autoDetectAndLoadPlugins();
    // setup routes
    crowi.setupRoutesAtLast(app);

    // login with passport
    req.logIn(adminUser, (err) => {
      if (err) { return next() }

      req.flash('successMessage', 'GROWI のインストールが完了しました！はじめに、このページで各種設定を確認してください。');
      return res.redirect('/admin/app');
    });
  };

  return actions;
};
