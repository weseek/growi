'use strict';

// Qiita API v2 documant https://qiita.com/api/v2/docs

const https = require('https');
const team = 'team';
const token = 'API token';
const options = {
  protocol: 'https:',
  host: `${team}.qiita.com`,
  path: '/api/v2/items',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'authorization': `Bearer ${token}`
  }
};

const req = https.request(options, (res) => {
    res.on('data', (chunk) => {
        console.log(`BODY: ${chunk}`);
    });
    res.on('end', () => {
        console.log('No more data in response.');
    });
})

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.end();
