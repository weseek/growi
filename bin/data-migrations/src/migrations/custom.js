/**
 * @typedef {import('../../types').MigrationModule} MigrationModule
 */

module.exports = [
  /**
   * @type {MigrationModule}
   */
  (body) => {
    // processor for MIGRATION_MODULE=custom
    // ADD YOUR PROCESS HERE!
    // https://github.com/weseek/growi/discussions/7180
    return body;
  },
];
