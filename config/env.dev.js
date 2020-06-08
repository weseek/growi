module.exports = {
  NODE_ENV: 'development',
  FILE_UPLOAD: 'mongodb',
  // MONGO_GRIDFS_TOTAL_LIMIT: 10485760,   // 10MB
  // MATHJAX: 1,
  // NO_CDN: true,
  ELASTICSEARCH_URI: 'http://192.168.2.120:9200/growi',
  // HACKMD_URI: 'http://127.0.0.1:3010',
  // DRAWIO_URI: 'http://localhost:8080/?offline=1&https=0',
  PLUGIN_NAMES_TOBE_LOADED: [
    'growi-plugin-lsx',
    'growi-plugin-pukiwiki-like-linker',
    'growi-plugin-attachment-refs',
  ],
  PUBLISH_OPEN_API: true,
  // USER_UPPER_LIMIT: 0,
  // DEV_HTTPS: true,
  // FORCE_WIKI_MODE: 'private', // 'public', 'private', undefined
};
