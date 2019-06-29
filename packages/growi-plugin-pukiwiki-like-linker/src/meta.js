const path = require('path');

module.exports = {
  pluginSchemaVersion: 3,
  serverEntries: [
  ],
  clientEntries: [
    path.join(__dirname, 'client-entry.js'),
  ],
};
