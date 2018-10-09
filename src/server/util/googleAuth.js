/**
 * googleAuth utility
 */

module.exports = function(config) {
  'use strict';

  const { GoogleApis } = require('googleapis');
  var google = new GoogleApis()
    , debug = require('debug')('growi:lib:googleAuth')
    , lib = {}
    ;

  function createOauth2Client(url) {
    return new google.auth.OAuth2(
      config.crowi['google:clientId'],
      config.crowi['google:clientSecret'],
      url
    );
  }

  lib.createAuthUrl = function(req, callback) {
    var callbackUrl = config.crowi['app:siteUrl:fixed'] + '/google/callback';
    var oauth2Client = createOauth2Client(callbackUrl);
    google.options({auth: oauth2Client});

    var redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
    });

    callback(null, redirectUrl);
  };

  lib.handleCallback = function(req, callback) {
    var callbackUrl = config.crowi['app:siteUrl:fixed'] + '/google/callback';
    var oauth2Client = createOauth2Client(callbackUrl);
    google.options({auth: oauth2Client});

    var code = req.session.googleAuthCode || null;

    if (!code) {
      return callback(new Error('No code exists.'), null);
    }

    debug('Request googleToken by auth code', code);
    oauth2Client.getToken(code, function(err, tokens) {
      debug('Result of google.getToken()', err, tokens);
      if (err) {
        return callback(new Error('[googleAuth.handleCallback] Error to get token.'), null);
      }

      oauth2Client.credentials = tokens;

      var oauth2 = google.oauth2('v2');
      oauth2.userinfo.get({}, function(err, response) {
        debug('Response of oauth2.userinfo.get', err, response);
        if (err) {
          return callback(new Error('[googleAuth.handleCallback] Error while proceccing userinfo.get.'), null);
        }

        let data = response.data;
        data.user_id = data.id;           // This is for B.C. (tokeninfo をつかっている前提のコードに対してのもの)
        return callback(null, data);
      });
    });
  };

  return lib;
};
