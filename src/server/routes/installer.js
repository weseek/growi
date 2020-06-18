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
    const { searchService } = crowi;
    if (!searchService.isReachable) {
      return;
    }

    await searchService.rebuildIndex();
  }

  async function createPage(filePath, pagePath, owner, lang) {
    try {
      const markdown = fs.readFileSync(filePath);
      return Page.create(pagePath, markdown, owner, {});
    }
    catch (err) {
      logger.error(`Failed to create ${pagePath}`, err);
    }
  }

  async function createInitialPages(owner, lang) {
    const promises = [];

    // create portal page for '/'
    promises.push(createPage(path.join(crowi.localeDir, lang, 'welcome.md'), '/', owner, lang));

    // create /Sandbox/*
    promises.push(createPage(path.join(crowi.localeDir, lang, 'sandbox.md'), '/Sandbox', owner, lang));
    promises.push(createPage(path.join(crowi.localeDir, lang, 'sandbox-bootstrap4.md'), '/Sandbox/Bootstrap4', owner, lang));
    promises.push(createPage(path.join(crowi.localeDir, lang, 'sandbox-diagrams.md'), '/Sandbox/Diagrams', owner, lang));
    promises.push(createPage(path.join(crowi.localeDir, lang, 'sandbox-math.md'), '/Sandbox/Math', owner, lang));

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
    // TODO: with transaction
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
      if (err) {
        req.flash('successMessage', req.t('message.complete_to_install1'));
        req.session.redirectTo = '/admin/app';
        return res.redirect('/login');
      }

      req.flash('successMessage', req.t('message.complete_to_install2'));
      return res.redirect('/admin/app');
    });
  };

  return actions;
};
