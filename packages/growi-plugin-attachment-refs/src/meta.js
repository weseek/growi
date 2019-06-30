const path = require('path');

module.exports = {
  pluginSchemaVersion: 3,
  serverEntries: [
    path.join(__dirname, 'server-entry.js'),
  ],
  clientEntries: [
    path.join(__dirname, 'client-entry.js'),
  ],
};
