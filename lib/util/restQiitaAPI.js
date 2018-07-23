'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

const https = require('https');
const team = 'team';
const token = 'api token';
var options = {
  protocol: 'https:',
  host: `${team}.qiita.com`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'authorization': `Bearer ${token}`
  }
};

function restAPI(path) {
  options.path = `/api/v2/${path}`;
  const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
          console.log(`BODY: ${chunk}`);
          return chunk;
      });
  })

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
  });

  req.end();
};

return {
  items: restAPI('items')
}
