module.exports = {
  NODE_ENV: 'development',
  FILE_UPLOAD: 'local',
  // MATHJAX: 1,
  // ELASTICSEARCH_URI: 'http://localhost:9200/growi',
  PLUGIN_NAMES_TOBE_LOADED: [
    // 'growi-plugin-lsx',
    // 'growi-plugin-pukiwiki-like-linker',
  ],
  // settings for 'visionmedia/debug'
  // see also './logger/config.prod.js'
  DEBUG: [
    // 'express:*',
    'growi:*',
  ].join(),
};
