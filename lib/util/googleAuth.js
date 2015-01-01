/**
 * googleAuth utility
 */

module.exports = function(app) {
  'use strict';

  var googleapis = require('googleapis')
    , debug = require('debug')('crowi:lib:googleAuth')
    , config = app.set('config')
    , lib = {}
    ;

  function createOauth2Client(url) {
    return new googleapis.auth.OAuth2Client(
      config.crowi['google:clientId'],
      config.crowi['google:clientSecret'],
      url
    );
  }

  lib.createAuthUrl = function(req, callback) {
    var callbackUrl = req.baseUrl + '/google/callback';
    var google = createOauth2Client(callbackUrl);

    var redirectUrl = google.generateAuthUrl({
      access_type: 'offline',
      scope: 'https://www.googleapis.com/auth/userinfo.email',
    });

    callback(null, redirectUrl);
  };

  lib.handleCallback = function(req, callback) {
    var callbackUrl = req.baseUrl + '/google/callback';
    var google = createOauth2Client(callbackUrl);
    var code = req.session.googleAuthCode || null;

    if (!code) {
      return callback(new Error('No code exists.'), null);
    }

    google.getToken(code, function(err, tokens) {
      if (err) {
        return callback(new Error('[googleAuth.handleCallback] Error to get token.'), null);
      }

      googleapis.discover('oauth2', 'v1').withOpts({cache: { path: __dirname + '/../tmp/googlecache'}}).execute(function(err, client) {
        if (err) {
          return callback(new Error('[googleAuth.handleCallback] Failed to discover oauth2 API endpoint.'), null);
        }

        var tokeninfo = client.oauth2.tokeninfo({id_token: tokens.id_token});
        tokeninfo.execute(function(err, response) {
          if (err) {
            return callback(new Error('[googleAuth.handleCallback] Error while proceccing tokeninfo.'), null);
          }

          return callback(null, response);
        });
      });
    });
  };

  return lib;
};
