const path = require('path');

module.exports = {
  pluginSchemaVersion: 2,
  serverEntries: [
  ],
  clientEntries: [
    path.join(__dirname, 'client-entry.js')
  ]
}
