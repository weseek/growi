'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

module.exports = function(Team, Token) {
  var restQiitaAPI = {};
  const https = require('https');
  const team = Team;
  const token = Token;

  var options = {
    protocol: 'https:',
    host: `${team}.qiita.com`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    }
  };

  function restAPI(path, options) {
    return new Promise((resolve, reject) => {
      options.path = `/api/v2/${path}`;
      const req = https.request(options, (res) => {
        res.on('data', (chunk) => {
            resolve(chunk);
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });

      req.end();
    });
  };

  restQiitaAPI.getQiitaUser = function() {
    return new Promise((resolve, reject) => {
      restAPI('users', options)
      .then(function(buf){
        return JSON.parse(buf.toString());
      })
      .then(function(user) {
        if(user.length > 0) {
          resolve(user);
        }
        else {
          reject('Unauthorized');
        }
      })
      .catch(function(err){
        reject(err);
      })
    });
  };

  restQiitaAPI.getQiitaPages = function() {
    return new Promise((resolve, reject) => {
      restAPI('items', options)
      .then(function(page){
        resolve(JSON.parse(page.toString()));
      })
      .catch(function(err){
        reject(err);
      })
    });
  };

  return restQiitaAPI;
}
