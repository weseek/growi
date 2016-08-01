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

}

