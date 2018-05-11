module.exports = {
  NODE_ENV: 'production',
  // settings for 'visionmedia/debug'
  // see also './logger/config.prod.js'
  DEBUG: [
    // 'express:*',
    'crowi:*',
    'growi:*',
  ].join(),
};
