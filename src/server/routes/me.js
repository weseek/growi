/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      UserGroup:
 *        description: UserGroup
 *        type: object
 *        properties:
 *          __v:
 *            type: number
 *            description: record version
 *            example: 0
 *          _id:
 *            type: string
 *            description: user group ID
 *            example: 5e2d56c1e35da4004ef7e0b0
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      UserGroupRelation:
 *        description: UserGroupRelation
 *        type: object
 *        properties:
 *          __v:
 *            type: number
 *            description: record version
 *            example: 0
 *          _id:
 *            type: string
 *            description: user group relation ID
 *            example: 5e2d56cbe35da4004ef7e0b1
 *          relatedGroup:
 *            $ref: '#/components/schemas/UserGroup'
 *          relatedUser:
 *            $ref: '#/components/schemas/User/properties/_id'
 *          createdAt:
 *            type: string
 *            description: date created at
 *            example: 2010-01-01T00:00:00.000Z
 */

module.exports = function(crowi, app) {
  const models = crowi.models;
  const UserGroupRelation = models.UserGroupRelation;
  const ExternalAccount = models.ExternalAccount;
  const ApiResponse = require('../util/apiResponse');

  // , pluginService = require('../service/plugin')

  const actions = {};

  const api = {};
  actions.api = api;

  /**
   * @swagger
   *
   *   /me/user-group-relations:
   *     get:
   *       tags: [Me, CrowiCompatibles]
   *       operationId: getUserGroupRelations
   *       summary: /me/user-group-relations
   *       description: Get user group relations
   *       responses:
   *         200:
   *           description: Succeeded to get user group relations.
   *           content:
   *             application/json:
   *               schema:
   *                 properties:
   *                   ok:
   *                     $ref: '#/components/schemas/V1Response/properties/ok'
   *                   userGroupRelations:
   *                     type: array
   *                     items:
   *                       $ref: '#/components/schemas/UserGroupRelation'
   *         403:
   *           $ref: '#/components/responses/403'
   *         500:
   *           $ref: '#/components/responses/500'
   */
  /**
   * retrieve user-group-relation documents
   * @param {object} req
   * @param {object} res
   */
  api.userGroupRelations = function(req, res) {
    UserGroupRelation.findAllRelationForUser(req.user)
      .then((userGroupRelations) => {
        return res.json(ApiResponse.success({ userGroupRelations }));
      });
  };

  actions.index = async function(req, res) {
    const User = crowi.model('User');
    const userData = await User.findById(req.user.id).populate({ path: 'imageAttachment', select: 'filePathProxied' });
    const renderVars = {};
    renderVars.user = userData;
    return res.render('me/index', renderVars);
  };

  actions.externalAccounts = {};
  actions.externalAccounts.list = function(req, res) {
    const userData = req.user;

    const renderVars = {};
    ExternalAccount.find({ user: userData })
      .then((externalAccounts) => {
        renderVars.externalAccounts = externalAccounts;
        return;
      })
      .then(() => {
        if (req.method === 'POST' && req.form.isValid) {
          // TODO impl
          return res.render('me/external-accounts', renderVars);
        }
        // method GET
        return res.render('me/external-accounts', renderVars);
      });
  };

  actions.drafts = {};
  actions.drafts.list = async function(req, res) {
    return res.render('me/drafts');
  };

  actions.updates = function(req, res) {
    res.render('me/update', {
    });
  };

  return actions;
};
