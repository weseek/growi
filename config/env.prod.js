module.exports = {
  NODE_ENV: 'production',
  // FORMAT_NODE_LOG: false,

  // settings for 'visionmedia/debug'
  // see also './logger/config.prod.js'
  DEBUG: [
    // 'express:*',
    'crowi:*',
    'growi:*',
  ].join(),
};
