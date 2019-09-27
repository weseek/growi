import { Container } from 'unstated';

import axios from 'axios';

import InterceptorManager from '@commons/service/interceptor-manager';

import emojiStrategy from '../util/emojione/emoji_strategy_shrinked.json';
import GrowiRenderer from '../util/GrowiRenderer';

import {
  DetachCodeBlockInterceptor,
  RestoreCodeBlockInterceptor,
} from '../util/interceptor/detach-code-blocks';

import i18nFactory from '../util/i18n';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */
export default class AppContainer extends Container {

  constructor() {
    super();

    this.state = {
      editorMode: null,
    };

    const body = document.querySelector('body');

    this.me = body.dataset.currentUsername || null; // will be initialized with null when data is empty string
    this.isAdmin = body.dataset.isAdmin === 'true';
    this.csrfToken = body.dataset.csrftoken;
    this.isPluginEnabled = body.dataset.pluginEnabled === 'true';
    this.isLoggedin = document.querySelector('.main-container.nologin') == null;

    this.config = JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}');

    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isMobile = /iphone|ipad|android/.test(userAgent);

    this.isDocSaved = true;

    this.originRenderer = new GrowiRenderer(this);

    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptor(new DetachCodeBlockInterceptor(this), 10); // process as soon as possible
    this.interceptorManager.addInterceptor(new RestoreCodeBlockInterceptor(this), 900); // process as late as possible

    const userlang = body.dataset.userlang;
    this.i18n = i18nFactory(userlang);

    this.users = [];
    this.userByName = {};
    this.userById = {};
    this.recoverData();

    if (this.isLoggedin) {
      this.fetchUsers();
    }

    this.containerInstances = {};
    this.componentInstances = {};
    this.rendererInstances = {};

    this.fetchUsers = this.fetchUsers.bind(this);
    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiDelete = this.apiDelete.bind(this);
    this.apiRequest = this.apiRequest.bind(this);
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AppContainer';
  }

  initPlugins() {
    if (this.isPluginEnabled) {
      const growiPlugin = window.growiPlugin;
      growiPlugin.installAll(this, this.originRenderer);
    }
  }

  injectToWindow() {
    window.appContainer = this;

    const originRenderer = this.getOriginRenderer();
    window.growiRenderer = originRenderer;

    // backward compatibility
    window.crowi = this;
    window.crowiRenderer = originRenderer;
    window.crowiPlugin = window.growiPlugin;
  }

  /**
   * @return {Object} window.Crowi (js/legacy/crowi.js)
   */
  getCrowiForJquery() {
    return window.Crowi;
  }

  getConfig() {
    return this.config;
  }

  /**
   * Register unstated container instance
   * @param {object} instance unstated container instance
   */
  registerContainer(instance) {
    if (instance == null) {
      throw new Error('The specified instance must not be null');
    }

    const className = instance.constructor.getClassName();

    if (this.containerInstances[className] != null) {
      throw new Error('The specified instance couldn\'t register because the same type object has already been registered');
    }

    this.containerInstances[className] = instance;
  }

  /**
   * Get registered unstated container instance
   * !! THIS METHOD SHOULD ONLY BE USED FROM unstated CONTAINERS !!
   * !! From component instances, inject containers with `import { Subscribe } from 'unstated'` !!
   *
   * @param {string} className
   */
  getContainer(className) {
    return this.containerInstances[className];
  }

  /**
   * Register React component instance
   * @param {string} id
   * @param {object} instance React component instance
   */
  registerComponentInstance(id, instance) {
    if (instance == null) {
      throw new Error('The specified instance must not be null');
    }

    if (this.componentInstances[id] != null) {
      throw new Error('The specified instance couldn\'t register because the same id has already been registered');
    }

    this.componentInstances[id] = instance;
  }

  /**
   * Get registered React component instance
   * @param {string} id
   */
  getComponentInstance(id) {
    return this.componentInstances[id];
  }

  getOriginRenderer() {
    return this.originRenderer;
  }

  /**
   * factory method
   */
  getRenderer(mode) {
    if (this.rendererInstances[mode] != null) {
      return this.rendererInstances[mode];
    }

    const renderer = new GrowiRenderer(this, this.originRenderer);
    // setup
    renderer.initMarkdownItConfigurers(mode);
    renderer.setup(mode);
    // register
    this.rendererInstances[mode] = renderer;

    return renderer;
  }

  getEmojiStrategy() {
    return emojiStrategy;
  }

  recoverData() {
    const keys = [
      'userByName',
      'userById',
      'users',
    ];

    keys.forEach((key) => {
      const keyContent = window.localStorage[key];
      if (keyContent) {
        try {
          this[key] = JSON.parse(keyContent);
        }
        catch (e) {
          window.localStorage.removeItem(key);
        }
      }
    });
  }

  fetchUsers() {
    const interval = 1000 * 60 * 15; // 15min
    const currentTime = new Date();
    if (window.localStorage.lastFetched && interval > currentTime - new Date(window.localStorage.lastFetched)) {
      return;
    }

    this.apiGet('/users.list', {})
      .then((data) => {
        this.users = data.users;
        window.localStorage.users = JSON.stringify(data.users);

        const userByName = {};
        const userById = {};
        for (let i = 0; i < data.users.length; i++) {
          const user = data.users[i];
          userByName[user.username] = user;
          userById[user._id] = user;
        }
        this.userByName = userByName;
        window.localStorage.userByName = JSON.stringify(userByName);

        this.userById = userById;
        window.localStorage.userById = JSON.stringify(userById);

        window.localStorage.lastFetched = new Date();
      })
      .catch((err) => {
        window.localStorage.removeItem('lastFetched');
      // ignore errors
      });
  }

  findUserById(userId) {
    if (this.userById && this.userById[userId]) {
      return this.userById[userId];
    }

    return null;
  }

  findUserByIds(userIds) {
    const users = [];
    for (const userId of userIds) {
      const user = this.findUserById(userId);
      if (user) {
        users.push(user);
      }
    }

    return users;
  }

  findUser(username) {
    if (this.userByName && this.userByName[username]) {
      return this.userByName[username];
    }

    return null;
  }

  launchHandsontableModal(componentKind, beginLineNumber, endLineNumber) {
    let targetComponent;
    switch (componentKind) {
      case 'page':
        targetComponent = this.getComponentInstance('Page');
        break;
    }
    targetComponent.launchHandsontableModal(beginLineNumber, endLineNumber);
  }

  async apiGet(path, params) {
    return this.apiRequest('get', path, { params });
  }

  async apiPost(path, params) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiRequest('post', path, params);
  }

  async apiDelete(path, params) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiRequest('delete', path, { data: params });
  }

  async apiRequest(method, path, params) {
    const res = await axios[method](`/_api${path}`, params);
    if (res.data.ok) {
      return res.data;
    }
    throw new Error(res.data.error);
  }

}
