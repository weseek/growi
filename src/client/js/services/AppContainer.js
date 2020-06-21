import { Container } from 'unstated';

import axios from 'axios';
import urljoin from 'url-join';

import InterceptorManager from '@commons/service/interceptor-manager';

import emojiStrategy from '../util/emojione/emoji_strategy_shrinked.json';
import GrowiRenderer from '../util/GrowiRenderer';

import {
  mediaQueryListForDarkMode,
  applyColorScheme,
} from '../util/color-scheme';
import Apiv1ErrorHandler from '../util/apiv1ErrorHandler';

import { i18nFactory } from '../util/i18n';
import apiv3ErrorHandler from '../util/apiv3ErrorHandler';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */
export default class AppContainer extends Container {

  constructor() {
    super();

    this.state = {
      preferDarkModeByMediaQuery: false,

      // stetes for contents
      recentlyUpdatedPages: [],
    };

    const body = document.querySelector('body');

    this.csrfToken = body.dataset.csrftoken;

    this.config = JSON.parse(document.getElementById('growi-context-hydrate').textContent || '{}');

    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isMobile = /iphone|ipad|android/.test(userAgent);

    const currentUserElem = document.getElementById('growi-current-user');
    if (currentUserElem != null) {
      this.currentUser = JSON.parse(currentUserElem.textContent);
    }

    const userLocaleId = this.currentUser.lang;
    this.i18n = i18nFactory(userLocaleId);

    this.containerInstances = {};
    this.componentInstances = {};
    this.rendererInstances = {};

    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiDelete = this.apiDelete.bind(this);
    this.apiRequest = this.apiRequest.bind(this);

    this.apiv3Root = '/_api/v3';
    this.apiv3 = {
      get: this.apiv3Get.bind(this),
      post: this.apiv3Post.bind(this),
      put: this.apiv3Put.bind(this),
      delete: this.apiv3Delete.bind(this),
    };
  }

  /**
   * Workaround for the mangling in production build to break constructor.name
   */
  static getClassName() {
    return 'AppContainer';
  }

  initApp() {
    this.initMediaQueryForColorScheme();

    this.injectToWindow();
  }

  initContents() {
    const body = document.querySelector('body');

    this.isAdmin = body.dataset.isAdmin === 'true';

    this.isDocSaved = true;

    this.originRenderer = new GrowiRenderer(this);

    this.interceptorManager = new InterceptorManager();

    if (this.currentUser != null) {
      // remove old user cache
      this.removeOldUserCache();
    }

    const isPluginEnabled = body.dataset.pluginEnabled === 'true';
    if (isPluginEnabled) {
      this.initPlugins();
    }

    this.injectToWindow();
  }

  async initMediaQueryForColorScheme() {
    const switchStateByMediaQuery = async(mql) => {
      const preferDarkMode = mql.matches;
      this.setState({ preferDarkModeByMediaQuery: preferDarkMode });

      applyColorScheme();
    };

    // add event listener
    mediaQueryListForDarkMode.addListener(switchStateByMediaQuery);
  }

  initPlugins() {
    const growiPlugin = window.growiPlugin;
    growiPlugin.installAll(this, this.originRenderer);
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

  get currentUserId() {
    if (this.currentUser == null) {
      return null;
    }
    return this.currentUser._id;
  }

  get currentUsername() {
    if (this.currentUser == null) {
      return null;
    }
    return this.currentUser.username;
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

  /**
   *
   * @param {string} breakpoint id of breakpoint
   * @param {function} handler event handler for media query
   * @param {boolean} invokeOnInit invoke handler after the initialization if true
   */
  addBreakpointListener(breakpoint, handler, invokeOnInit = false) {
    document.addEventListener('DOMContentLoaded', () => {
      // get the value of '--breakpoint-*'
      const breakpointPixel = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${breakpoint}`), 10);

      const mediaQuery = window.matchMedia(`(min-width: ${breakpointPixel}px)`);

      // add event listener
      mediaQuery.addListener(handler);
      // initialize
      if (invokeOnInit) {
        handler(mediaQuery);
      }
    });
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

  removeOldUserCache() {
    if (window.localStorage.userByName == null) {
      return;
    }

    const keys = ['userByName', 'userById', 'users', 'lastFetched'];

    keys.forEach((key) => {
      window.localStorage.removeItem(key);
    });
  }

  async retrieveRecentlyUpdated() {
    const { data } = await this.apiv3Get('/pages/recent');
    this.setState({ recentlyUpdatedPages: data.pages });
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

  launchDrawioModal(componentKind, beginLineNumber, endLineNumber) {
    let targetComponent;
    switch (componentKind) {
      case 'page':
        targetComponent = this.getComponentInstance('Page');
        break;
    }
    targetComponent.launchDrawioModal(beginLineNumber, endLineNumber);
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

    // Return error code if code is exist
    if (res.data.code != null) {
      const error = new Apiv1ErrorHandler(res.data.error, res.data.code);
      throw error;
    }

    throw new Error(res.data.error);
  }

  async apiv3Request(method, path, params) {
    try {
      const res = await axios[method](urljoin(this.apiv3Root, path), params);
      return res.data;
    }
    catch (err) {
      const errors = apiv3ErrorHandler(err);
      throw errors;
    }
  }

  async apiv3Get(path, params) {
    return this.apiv3Request('get', path, { params });
  }

  async apiv3Post(path, params = {}) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiv3Request('post', path, params);
  }

  async apiv3Put(path, params = {}) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiv3Request('put', path, params);
  }

  async apiv3Delete(path, params = {}) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiv3Request('delete', path, { params });
  }

}
