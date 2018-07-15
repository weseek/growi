/**
 * importer
 */

module.exports = function(crowi) {
  'use strict';

  var debug = require('debug')('growi:lib:importer')
    , esa = require('esa-nodejs')
    , esaClient = {}
    , config = crowi.getConfig()
    , util = {}
    ;

  /**
   * Initialize importer
   */
  function initialize() {
    esaClient = esa({
      team:        config.crowi['importer:esa:team_name'],
      accessToken: config.crowi['importer:esa:access_token'],
    });
    debug('esa client is initialized');
  }

  /**
   * Import post data from esa to GROWI
   */
  util.importAllPostsFromEsa = function() {
    // [TODO] TBD
  }

  /**
   * Import post data from esa to GROWI
   */
  util.testConnectionToEsa = function(callback) {
    esaClient.api.team(function(err, res) {
      if (err) {
        console.log(`team: ${config.crowi['importer:esa:team_name']}, access_token: ${config.crowi['importer:esa:access_token']}`);
        var errMessage = `Test connection to esa failed. 'esa-nodejs' return ${err}`;
        console.log(errMessage);
        debug(errMessage);
        return callback({ status: false, message: errMessage });
      }
      console.log("test Connection To esa success");
      return callback({ status: true });
    })
  }

  initialize();
  util.esaClient = esaClient;

  return util;
};
