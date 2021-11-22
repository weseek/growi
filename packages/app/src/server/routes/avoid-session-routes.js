module.exports = [
  // exclude route _hackmd from routes that don't use session
  // Reference : https://github.com/jaredhanson/passport/issues/858

  /^\/api-docs\//,
];
