'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

module.exports = function(Team, Token) {
  var restQiitaAPI = {};
  const request = require('request');
  const team = Team;
  const token = Token;

  var options = {
    url: `https://${team}.qiita.com`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  };

  function restAPI(path, options) {
    return new Promise((resolve, reject) => {
      options.url = `${options.url}/api/v2/${path}`;
      // const req = https.request(options, (res) => {
      //   const total = res.headers['total-count'];
      //   res.on('data', (chunk) => {
      //     resolve([chunk, total]);
      //   });
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
      restAPI('users', options)
      .then(function(buf, link){
        return JSON.parse(buf.toString());
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

  restQiitaAPI.getQiitaPages = function(pageNum) {
    return new Promise((resolve, reject) => {
      restAPI(`items?page=${pageNum}&per_page=100`, options)
      .then(function(res){
        const page = res[0];
        const total = res[1];
        resolve([JSON.parse(page.toString()), total]);
      })
      .catch(function(err){
        reject(err);
      })
    });
  };

  return restQiitaAPI;
}
