'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

module.exports = function(qiitaTeam, qiitaToken) {
  var restQiitaAPI = {};
  const team = qiitaTeam;
  const token = qiitaToken;

  const axiosBase = require('axios');
  const axios = axiosBase.create({
    baseURL: `https://${team}.qiita.com/api/v2`,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      'authorization': `Bearer ${token}`
    },
    responseType: 'json'
  });

  function restAPI(path) {
    return new Promise((resolve, reject) => {
      axios.get(path)
      .then(function(res) {
        const data = res.data;
        const total = res.headers['total-count'];
        resolve([data, total]);
      })
      .catch(function(err) {
        reject(err);
      });
    });
  };

  restQiitaAPI.getQiitaUser = function() {
    return new Promise((resolve, reject) => {
      restAPI('/users')
      .then(function(res) {
        const user = res[0];
        if(user.length > 0) {
          resolve(user);
        }
        else {
          reject('Incorrect team name or access token.');
        }
      })
      .catch(function(err){
        reject(err);
      })
    });
  };

  restQiitaAPI.getQiitaPages = function(pageNum, per_page) {
    return new Promise((resolve, reject) => {
      restAPI(`/items?page=${pageNum}&per_page=${per_page}`)
      .then(function(res) {
        const pages = res[0];
        const total = res[1];
        if(pages.length > 0) {
          resolve([pages, total]);
        }
        else {
          reject('page not find.');
        }
      })
      .catch(function(err){
        reject(err);
      })
    });
  };

  return restQiitaAPI;
}
