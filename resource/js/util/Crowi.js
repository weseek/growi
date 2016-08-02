/**
 * Crowi context class for client
 */

import axios from 'axios'

export default class Crowi {
  constructor(context, window) {
    this.context = context;

    this.location = window.location || {};
    this.document = window.document || {};
    this.localStorage = window.localStorage || {};

    this.fetchUsers = this.fetchUsers.bind(this);
    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiRequest = this.apiRequest.bind(this);

    this.users = [];
    this.userByName = {};

    this.recoverData();
  }

  recoverData() {
    const keys = [
      'userByName',
      'users',
    ];

    keys.forEach(key => {
      if (this.localStorage[key]) {
        try {
          this[key] = JSON.parse(this.localStorage[key]);
        } catch (e) {
          this.localStorage.removeItem(key);
        }
      }
    });
  }

  fetchUsers () {
    const interval = 1000*60*10; // 5min
    const currentTime = new Date();
    if (!this.localStorage.lastFetched) {
      this.localStorage.lastFetched = new Date();
    }
    if (interval > currentTime - new Date(this.localStorage.lastFetched)) {
      return ;
    }

    this.apiGet('/users.list', {})
    .then(data => {
      this.users = data.users;
      this.localStorage.users = JSON.stringify(data.users);

      let userByName = {};
      for (let i = 0; i < data.users.length; i++) {
        const user = data.users[i];
        userByName[user.username] = user;
      }
      this.userByName = userByName;
      this.localStorage.userByName = JSON.stringify(userByName);

      this.localStorage.lastFetched = new Date();
      //console.log('userByName', this.localStorage.userByName);
    }).catch(err => {
      // ignore errors
    });
  }

  findUser(username) {
    if (this.userByName && this.userByName[username]) {
      return this.userByName[username];
    }

    return null;
  }

  apiGet(path, params) {
    return this.apiRequest('get', path, params);
  }

  apiPost(path, params) {
    return this.apiRequest('post', path, params);
  }

  apiRequest(method, path, params) {
    return new Promise((resolve, reject) => {
      axios[method](`/_api${path}`, {params})
      .then(res => {
        if (res.data.ok) {
          resolve(res.data);
        } else {
          // FIXME?
          throw new Error(res.data);
        }
      }).catch(res => {
          // FIXME?
        throw new Error(res);
      });
    });
  }

  static escape (html, encode) {
    return html
      .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  static unescape(html) {
    return html.replace(/&([#\w]+);/g, function(_, n) {
      n = n.toLowerCase();
      if (n === 'colon') return ':';
      if (n.charAt(0) === '#') {
        return n.charAt(1) === 'x'
          ? String.fromCharCode(parseInt(n.substring(2), 16))
          : String.fromCharCode(+n.substring(1));
      }
      return '';
    });
  }
}

