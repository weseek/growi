import { Container } from 'unstated';

import axios from 'axios';

import InterceptorManager from '@commons/service/interceptor-manager';

import emojiStrategy from '../util/emojione/emoji_strategy_shrinked.json';

import {
  DetachCodeBlockInterceptor,
  RestoreCodeBlockInterceptor,
} from '../util/interceptor/detach-code-blocks';

/**
 * Service container related to options for Application
 * @extends {Container} unstated Container
 */
export default class AppContainer extends Container {

  constructor() {
    super();

    const body = document.querySelector('body');

    this.me = body.dataset.currentUsername;
    this.isAdmin = body.dataset.isAdmin;
    this.csrfToken = body.dataset.csrftoken;

    this.config = JSON.parse(document.getElementById('crowi-context-hydrate').textContent || '{}');

    const userAgent = window.navigator.userAgent.toLowerCase();
    this.isMobile = /iphone|ipad|android/.test(userAgent);

    this.isDocSaved = true;

    this.fetchUsers = this.fetchUsers.bind(this);
    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiRequest = this.apiRequest.bind(this);

    this.interceptorManager = new InterceptorManager();
    this.interceptorManager.addInterceptor(new DetachCodeBlockInterceptor(this), 10); // process as soon as possible
    this.interceptorManager.addInterceptor(new RestoreCodeBlockInterceptor(this), 900); // process as late as possible

    this.users = [];
    this.userByName = {};
    this.userById = {};
    this.draft = {};

    this.recoverData();

    this.containerInstances = {};
    this.componentInstances = {};
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

    const className = instance.constructor.name;

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
   * @param {object} instance React component instance
   */
  registerComponentInstance(instance) {
    if (instance == null) {
      throw new Error('The specified instance must not be null');
    }

    const className = instance.constructor.name;

    if (this.componentInstances[className] != null) {
      throw new Error('The specified instance couldn\'t register because the same type object has already been registered');
    }

    this.componentInstances[className] = instance;
  }

  /**
   * Get registered React component instance
   * @param {string} className
   */
  getComponentInstance(className) {
    return this.componentInstances[className];
  }

  setIsDocSaved(isSaved) {
    this.isDocSaved = isSaved;
  }

  getIsDocSaved() {
    return this.isDocSaved;
  }

  getEmojiStrategy() {
    return emojiStrategy;
  }

  recoverData() {
    const keys = [
      'userByName',
      'userById',
      'users',
      'draft',
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

  createPage(pagePath, markdown, additionalParams = {}) {
    const params = Object.assign(additionalParams, {
      path: pagePath,
      body: markdown,
    });
    return this.apiPost('/pages.create', params)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.error);
        }
        return res.page;
      });
  }

  updatePage(pageId, revisionId, markdown, additionalParams = {}) {
    const params = Object.assign(additionalParams, {
      page_id: pageId,
      revision_id: revisionId,
      body: markdown,
    });
    return this.apiPost('/pages.update', params)
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.error);
        }
        return res.page;
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

  apiGet(path, params) {
    return this.apiRequest('get', path, { params });
  }

  apiPost(path, params) {
    if (!params._csrf) {
      params._csrf = this.csrfToken;
    }

    return this.apiRequest('post', path, params);
  }

  apiRequest(method, path, params) {
    return new Promise((resolve, reject) => {
      axios[method](`/_api${path}`, params)
        .then((res) => {
          if (res.data.ok) {
            resolve(res.data);
          }
          else {
            reject(new Error(res.data.error));
          }
        })
        .catch((res) => {
          reject(res);
        });
    });
  }

}
