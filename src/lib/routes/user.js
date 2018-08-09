module.exports = function(crowi, app) {
  'use strict';

  var Page = crowi.model('Page')
    , User = crowi.model('User')
    , Revision = crowi.model('Revision')
    , Bookmark = crowi.model('Bookmark')
    , ApiResponse = require('../util/apiResponse')
    , actions = {}
    , api = {};

  actions.api = api;

  api.bookmarks = function(req, res) {
    var options = {
      skip: req.query.offset || 0,
      limit: req.query.limit || 50,
    };
    Bookmark.findByUser(req.user, options, function(err, bookmarks) {
      res.json(bookmarks);
    });
  };

  api.checkUsername = function(req, res) {
    var username = req.query.username;

    User.findUserByUsername(username)
    .then(function(userData) {
      if (userData) {
        return res.json({ valid: false });
      }
      else {
        return res.json({ valid: true });
      }
    }).catch(function(err) {
      return res.json({ valid: true });
    });
  };

  /**
   * @api {get} /users.list Get user list
   * @apiName GetUserList
   * @apiGroup User
   *
   * @apiParam {String} user_ids
   */
  api.list = function(req, res) {
    var userIds = req.query.user_ids || null; // TODO: handling

    var userFetcher;
    if (!userIds || userIds.split(',').length <= 0) {
      userFetcher = User.findAllUsers();
    }
    else {
      userFetcher = User.findUsersByIds(userIds.split(','));
    }

    userFetcher
    .then(function(userList) {
      return userList.map((user) => {
        // omit email
        if (true !== user.isEmailPublished) { // compare to 'true' because Crowi original data doesn't have 'isEmailPublished'
          user.email = undefined;
        }
        return user;
      });
    })
    .then(function(userList) {
      var result = {
        users: userList,
      };

      return res.json(ApiResponse.success(result));
    }).catch(function(err) {
      return res.json(ApiResponse.error(err));
    });
  };

  return actions;
};
