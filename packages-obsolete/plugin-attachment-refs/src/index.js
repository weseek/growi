const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  pluginSchemaVersion: 4,
  serverEntries: [
    isProd ? 'dist/cjs/server-entry.js' : 'src/server-entry.js',
  ],
  clientEntries: [
    'src/client-entry.js',
  ],
};
