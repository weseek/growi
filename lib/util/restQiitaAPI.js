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
            // console.log(`${chunk}`);
            console.log(`${chunk}`);
            resolve(chunk);
        });
      });

      req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
      });

      req.end();
    });
  };

  restQiitaAPI.getQiita = function() {
    return new Promise((resolve, reject) => {
      restAPI('users', options)
      .then(function(user){
        resolve(JSON.parse(user.toString()));
      })
      .catch(function(err){
        reject(err);
      })
    });
  };
      // tags: restAPI('tags'),
      // templates: restAPI('templates'),
      // projects: restAPI('projects'),
      // users: restAPI('users'),
      // comments: restAPI(`items/${item_id}/comments`),
      // project_comments: restAPI(`projects/${project_id}/comments`),
      // itemreactions: restAPI(`items/${item_id}/reactions`),
      // comment_reactions: restAPI(`comments/${comment_id}/reactions`),
      // project_reactions: restAPI(`projects/${project_id}/reactions`),
      // items: restAPI('items'),
  return restQiitaAPI;
}
