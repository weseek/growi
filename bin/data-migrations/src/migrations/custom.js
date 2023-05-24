
/* eslint-disable no-undef, no-var, vars-on-top, no-restricted-globals, regex/invalid */
// ignore lint error because this file is js as mongoshell

// ===========================================
// processors for old format
// ===========================================

// processor for MIGRATION_MODULE=custom

module.exports = [
  (body) => {
    // ADD YOUR PROCESS HERE!
    // https://github.com/weseek/growi/discussions/7180
    return body;
  },
];
