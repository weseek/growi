import Bookmark from '~/server/models/bookmark';

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      User:
 *        description: User
 *        type: object
 *        properties:
 *          __v:
 *            type: number
 *            description: record version
 *            example: 0
 *          _id:
 *            type: string
 *            description: user ID
 *            example: 5ae5fccfc5577b0004dbd8ab
 *          lang:
 *            type: string
 *            description: language
 *            example: 'en_US'
 *          status:
 *            type: integer
 *            description: status
 *            example: 0
 *          admin:
 *            type: boolean
 *            description: whether the admin
 *            example: false
 *          email:
 *            type: string
 *            description: E-Mail address
 *            example: alice@aaa.aaa
 *          username:
 *            type: string
 *            description: username
 *            example: alice
 *          name:
 *            type: string
 *            description: full name
 *            example: Alice
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = function(crowi, app) {
  const User = crowi.model('User');
  const ApiResponse = require('../util/apiResponse');

  const actions = {};


  const api = {};

  actions.api = api;

  api.checkUsername = function(req, res) {
    throw new Error('DEPRECATED: Use /_api/v3/users/exists');
    // const username = req.query.username;

    // User.findUserByUsername(username)
    //   .then((userData) => {
    //     if (userData) {
    //       return res.json({ valid: false });
    //     }

    //     return res.json({ valid: true });
    //   })
    //   .catch((err) => {
    //     return res.json({ valid: true });
    //   });
  };

  /**
   * @swagger
   *
   *    /users.list:
   *      get:
   *        tags: [Users, CrowiCompatibles]
   *        operationId: listUsersV1
   *        summary: /users.list
   *        description: Get list of users
   *        parameters:
   *          - in: query
   *            name: user_ids
   *            schema:
   *              type: string
   *              description: user IDs
   *              example: 5e06fcc7516d64004dbf4da6,5e098d53baa2ac004e7d24ad
   *        responses:
   *          200:
   *            description: Succeeded to get list of users.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    users:
   *                      type: array
   *                      items:
   *                        $ref: '#/components/schemas/User'
   *                      description: user list
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
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
    if (userIds == null || userIds.length <= 0) {
      userFetcher = User.findAllUsers();
    }
    else {
      userFetcher = User.findUsersByIds(userIds);
    }

    const data = {};
    try {
      const users = await userFetcher;
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
