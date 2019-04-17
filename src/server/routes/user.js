module.exports = function(crowi, app) {
  const User = crowi.model('User');
  const Bookmark = crowi.model('Bookmark');
  const ApiResponse = require('../util/apiResponse');

  const actions = {};


  const api = {};

  actions.api = api;

  api.bookmarks = function(req, res) {
    const options = {
      skip: req.query.offset || 0,
      limit: req.query.limit || 50,
    };
    Bookmark.findByUser(req.user, options, (err, bookmarks) => {
      res.json(bookmarks);
    });
  };

  api.checkUsername = function(req, res) {
    const username = req.query.username;

    User.findUserByUsername(username)
      .then((userData) => {
        if (userData) {
          return res.json({ valid: false });
        }

        return res.json({ valid: true });
      })
      .catch((err) => {
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
  api.list = async function(req, res) {
    const userIds = req.query.user_ids || null; // TODO: handling

    let userFetcher;
    if (!userIds || userIds.split(',').length <= 0) {
      userFetcher = User.findAllUsers();
    }
    else {
      userFetcher = User.findUsersByIds(userIds.split(','));
    }

    const data = {};
    try {
      const users = await userFetcher.populate(User.IMAGE_POPULATION);
      data.users = users.map((user) => {
        // omit email
        if (user.isEmailPublished !== true) { // compare to 'true' because Crowi original data doesn't have 'isEmailPublished'
          user.email = undefined;
        }
        return user.toObject({ virtuals: true });
      });
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }

    return res.json(ApiResponse.success(data));
  };

  return actions;
};
