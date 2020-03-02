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
  const debug = require('debug')('growi:routes:me');
  const logger = require('@alias/logger')('growi:routes:me');
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

  actions.index = function(req, res) {
    return res.render('me/index');
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

  actions.externalAccounts.disassociate = function(req, res) {
    const userData = req.user;

    const redirectWithFlash = (type, msg) => {
      req.flash(type, msg);
      return res.redirect('/me/external-accounts');
    };

    if (req.body == null) {
      redirectWithFlash('errorMessage', 'Invalid form.');
    }

    // make sure password set or this user has two or more ExternalAccounts
    new Promise((resolve, reject) => {
      if (userData.password != null) {
        resolve(true);
      }
      else {
        ExternalAccount.count({ user: userData })
          .then((count) => {
            resolve(count > 1);
          });
      }
    })
      .then((isDisassociatable) => {
        if (!isDisassociatable) {
          const e = new Error();
          e.name = 'couldntDisassociateError';
          throw e;
        }

        const providerType = req.body.providerType;
        const accountId = req.body.accountId;

        return ExternalAccount.findOneAndRemove({ providerType, accountId, user: userData });
      })
      .then((account) => {
        if (account == null) {
          return redirectWithFlash('errorMessage', 'ExternalAccount not found.');
        }

        return redirectWithFlash('successMessage', 'Successfully disassociated.');
      })
      .catch((err) => {
        if (err) {
          if (err.name === 'couldntDisassociateError') {
            return redirectWithFlash('couldntDisassociateError', true);
          }

          return redirectWithFlash('errorMessage', err.message);
        }
      });
  };

  actions.externalAccounts.associateLdap = function(req, res) {
    const passport = require('passport');
    const passportService = crowi.passportService;

    const redirectWithFlash = (type, msg) => {
      req.flash(type, msg);
      return res.redirect('/me/external-accounts');
    };

    if (!passportService.isLdapStrategySetup) {
      debug('LdapStrategy has not been set up');
      return redirectWithFlash('warning', 'LdapStrategy has not been set up');
    }

    passport.authenticate('ldapauth', (err, user, info) => {
      if (res.headersSent) { // dirty hack -- 2017.09.25
        return; //              cz: somehow passport.authenticate called twice when ECONNREFUSED error occurred
      }

      if (err) { // DB Error
        logger.error('LDAP Server Error: ', err);
        return redirectWithFlash('warningMessage', 'LDAP Server Error occured.');
      }
      if (info && info.message) {
        return redirectWithFlash('warningMessage', info.message);
      }
      if (user) {
        // create ExternalAccount
        const ldapAccountId = passportService.getLdapAccountIdFromReq(req);
        const user = req.user;

        ExternalAccount.associate('ldap', ldapAccountId, user)
          .then(() => {
            return redirectWithFlash('successMessage', 'Successfully added.');
          })
          .catch((err) => {
            return redirectWithFlash('errorMessage', err.message);
          });
      }
    })(req, res, () => {});
  };

  actions.updates = function(req, res) {
    res.render('me/update', {
    });
  };

  return actions;
};
