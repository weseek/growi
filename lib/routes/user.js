module.exports = function(crowi, app) {
  'use strict';

   var Page = crowi.model('Page')
    , User = crowi.model('User')
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , actions = {}
    , api = {};

  actions.api = api;

  api.bookmarks = function(req, res) {
    var options = {
      skip: req.query.offset || 0,
      limit: req.query.limit || 50,
    };
    Bookmark.findByUser(req.user, options, function (err, bookmarks) {
      res.json(bookmarks);
    });
  };

  api.checkUsername = function(req, res) {
    var username = req.query.username;

    User.findUserByUsername(username, function(err, userData) {
      if (userData) {
        return res.json({
          valid: false
        });
      } else {
        return res.json({
          valid: true
        });
      }
    });
  };

  return actions;
};
