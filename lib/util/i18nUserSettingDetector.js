module.exports = {
  name: 'userSettingDetector',

  lookup: function(req, res, options) {
    // return null if
    //  1. user doesn't logged in
    //  2. req.user is username/email string to login which is set by basic-auth-connect
    if (req.user == null || !(req.user instanceof Object)) {
      return null;
    }
    return req.user.lang || null;
  },

  cacheUserlanguage: function(req, res, lng, options) {
    // nothing to do
  }
};
