import { Container } from 'unstated';

import InterceptorManager from '~/services/interceptor-manager';

import {
  apiDelete, apiGet, apiPost, apiRequest,
} from '../util/apiv1-client';
import {
  apiv3Delete, apiv3Get, apiv3Post, apiv3Put,
} from '../util/apiv3-client';
import emojiStrategy from '../util/emojione/emoji_strategy_shrinked.json';
import GrowiRenderer from '../util/GrowiRenderer';

import {
  mediaQueryListForDarkMode,
  applyColorScheme,
} from '../util/color-scheme';

import { i18nFactory } from '../util/i18n';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */
export default class AppContainer extends Container {

  constructor() {
    super();

    this.state = {
      preferDarkModeByMediaQuery: false,
    };

    // get csrf token from body element
    // DO NOT REMOVE: uploading attachment data requires appContainer.csrfToken
    const body = document.querySelector('body');
    this.csrfToken = body.dataset.csrftoken;

    this.config = JSON.parse(document.getElementById('growi-context-hydrate').textContent || '{}');

    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isMobile = /iphone|ipad|android/.test(userAgent);

    const currentUserElem = document.getElementById('growi-current-user');
    if (currentUserElem != null) {
      this.currentUser = JSON.parse(currentUserElem.textContent);
    }

    const isSharedPageElem = document.getElementById('is-shared-page');

    // check what kind of user
    this.isGuestUser = this.currentUser == null;
    this.isSharedUser = isSharedPageElem != null && this.currentUser == null;

    const userLocaleId = this.currentUser?.lang;
    this.i18n = i18nFactory(userLocaleId);

    this.containerInstances = {};
    this.componentInstances = {};
    this.rendererInstances = {};

    this.apiGet = apiGet;
    this.apiPost = apiPost;
    this.apiDelete = apiDelete;
    this.apiRequest = apiRequest;

    this.apiv3Get = apiv3Get;
    this.apiv3Post = apiv3Post;
    this.apiv3Put = apiv3Put;
    this.apiv3Delete = apiv3Delete;

    this.apiv3 = {
      get: apiv3Get,
      post: apiv3Post,
      put: apiv3Put,
      delete: apiv3Delete,
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

}
