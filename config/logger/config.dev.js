module.exports = {
  default: 'info',

  /*
   * configure level for server
   */
  // 'express:*': 'debug',
  // 'growi:*': 'debug',
  'growi:crowi': 'debug',
  // 'growi:crow:dev': 'debug',
  'growi:crowi:express-init': 'debug',
  'growi:models:external-account': 'debug',
  // 'growi:routes:login': 'debug',
  'growi:routes:login-passport': 'debug',
  'growi:service:PassportService': 'debug',
  'growi:lib:search': 'debug',
  // 'growi:service:GlobalNotification': 'debug',
  // 'growi:lib:importer': 'debug',
  // 'growi:routes:page': 'debug',
  // 'growi-plugin:*': 'debug',
  // 'growi:InterceptorManager': 'debug',

  // email
  // 'growi:lib:mailer': 'debug',

  /*
   * configure level for client
   */
  'growi:app': 'debug',
  'growi:StaffCredit': 'debug',
};
