const debug = require('debug')('growi:lib:googleAuth');
const urljoin = require('url-join');
const { GoogleApis } = require('googleapis');

/**
 * googleAuth utility
 */

module.exports = function(crowi) {
  const google = new GoogleApis();
  const config = crowi.getConfig();

  const lib = {};
  function createOauth2Client(url) {
    return new google.auth.OAuth2(
      config.crowi['google:clientId'],
      config.crowi['google:clientSecret'],
      url,
    );
  }

  lib.createAuthUrl = function(req, callback) {
    const callbackUrl = urljoin(crowi.appService.getSiteUrl(), '/google/callback');
    const oauth2Client = createOauth2Client(callbackUrl);
    google.options({ auth: oauth2Client });

    const redirectUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['profile', 'email'],
    });

    callback(null, redirectUrl);
  };

  lib.handleCallback = function(req, callback) {
    const callbackUrl = urljoin(crowi.appService.getSiteUrl(), '/google/callback');
    const oauth2Client = createOauth2Client(callbackUrl);
    google.options({ auth: oauth2Client });

    const code = req.session.googleAuthCode || null;

    if (!code) {
      return callback(new Error('No code exists.'), null);
    }

    debug('Request googleToken by auth code', code);
    oauth2Client.getToken(code, (err, tokens) => {
      debug('Result of google.getToken()', err, tokens);
      if (err) {
        return callback(new Error('[googleAuth.handleCallback] Error to get token.'), null);
      }

      oauth2Client.credentials = tokens;

      const oauth2 = google.oauth2('v2');
      oauth2.userinfo.get({}, (err, response) => {
        debug('Response of oauth2.userinfo.get', err, response);
        if (err) {
          return callback(new Error('[googleAuth.handleCallback] Error while proceccing userinfo.get.'), null);
        }

        const data = response.data;
        data.user_id = data.id; // This is for B.C. (tokeninfo をつかっている前提のコードに対してのもの)
        return callback(null, data);
      });
    });
  };

  return lib;
};
