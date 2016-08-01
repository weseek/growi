/**
 * Crowi context class for client
 */

import axios from 'axios'

export default class Crowi {
  constructor(context, window) {
    this.context = context;

    this.location = window.location || {};
    this.document = window.document || {};

    this.apiGet = this.apiGet.bind(this);
    this.apiPost = this.apiPost.bind(this);
    this.apiRequest = this.apiRequest.bind(this);
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

