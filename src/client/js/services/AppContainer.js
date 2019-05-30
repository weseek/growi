import { Container } from 'unstated';

import axios from 'axios';
import io from 'socket.io-client';

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

    this.socketClientId = Math.floor(Math.random() * 100000);
    this.page = undefined;
    this.pageEditor = undefined;
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
    this.editorOptions = {};

    this.recoverData();

    this.socket = io();
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

  setPage(page) {
    this.page = page;
  }

  setPageEditor(pageEditor) {
    this.pageEditor = pageEditor;
  }

  setIsDocSaved(isSaved) {
    this.isDocSaved = isSaved;
  }

  getIsDocSaved() {
    return this.isDocSaved;
  }

  getWebSocket() {
    return this.socket;
  }

  getSocketClientId() {
    return this.socketClientId;
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

  setCaretLine(line) {
    if (this.pageEditor != null) {
      this.pageEditor.setCaretLine(line);
    }
  }

  focusToEditor() {
    if (this.pageEditor != null) {
      this.pageEditor.focusToEditor();
    }
  }

  clearDraft(path) {
    delete this.draft[path];
    window.localStorage.setItem('draft', JSON.stringify(this.draft));
  }

  clearAllDrafts() {
    window.localStorage.removeItem('draft');
  }

  saveDraft(path, body) {
    this.draft[path] = body;
    window.localStorage.setItem('draft', JSON.stringify(this.draft));
  }

  findDraft(path) {
    if (this.draft && this.draft[path]) {
      return this.draft[path];
    }

    return null;
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
        targetComponent = this.page;
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
