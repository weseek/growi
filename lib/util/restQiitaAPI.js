'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

module.exports = function(qiitaTeam, qiitaToken) {
  var restQiitaAPI = {};
  const request = require('request');
  const team = qiitaTeam;
  const token = qiitaToken;

  var options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  };

  function restAPI(path, team, options) {
    return new Promise((resolve, reject) => {
      options.url = `https://${team}.qiita.com/api/v2/${path}`;
      request(options, function(err, res, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        const total = res.headers['total-count'];
        resolve([body, total]);
      });
    });
  };

  restQiitaAPI.getQiitaUser = function() {
    return new Promise((resolve, reject) => {
      restAPI('users', team, options)
      .then(function(res){
        return JSON.parse(res[0].toString());
      })
      .then(function(user) {
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
      restAPI(`items?page=${pageNum}&per_page=${per_page}`, team, options)
      .then(function(res) {
        const pages = JSON.parse(res[0].toString());
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
