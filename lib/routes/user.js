module.exports = function(app) {
  'use strict';

   var models = app.set('models')
    , Page = models.Page
    , User = models.User
    , Revision = models.Revision
    , Bookmark = models.Bookmark
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
