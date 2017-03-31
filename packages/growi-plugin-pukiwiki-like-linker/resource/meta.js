const path = require('path');

export default {
  pluginSchemaVersion: 2,
  serverEntries: [
  ],
  clientEntries: [
    path.join(__dirname, 'client-entry.js')
  ]
}
