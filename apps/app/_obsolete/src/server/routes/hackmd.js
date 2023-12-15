import * as hackmdFiles from '@growi/hackmd';

import loggerFactory from '~/utils/logger';

/* eslint-disable no-use-before-define */

const logger = loggerFactory('growi:routes:hackmd');

const axios = require('axios');
const ejs = require('ejs');

const ApiResponse = require('../util/apiResponse');

/**
 * @swagger
 *
 *  components:
 *    schemas:
 *      Hackmd:
 *        description: Hackmd
 *        type: object
 *        properties:
 *          pageIdOnHackmd:
 *            type: string
 *            description: page ID on HackMD
 *            example: qLnodHLxT6C3hVEVczvbDQ
 *          revisionIdHackmdSynced:
 *            $ref: '#/components/schemas/Revision/properties/_id'
 *          hasDraftOnHackmd:
 *            type: boolean
 *            description: has draft on HackMD
 *            example: false
 */
module.exports = function(crowi, app) {
  const Page = crowi.models.Page;
  const pageEvent = crowi.event('page');

  /**
   * GET /_hackmd/load-agent
   *
   * loadAgent action
   * This should be access from HackMD and send agent script
   *
   * @param {object} req
   * @param {object} res
   */
  const loadAgent = function(req, res) {

    const origin = crowi.appService.getSiteUrl();

    // generate definitions to replace
    const definitions = {
      origin,
    };

    // inject origin to script
    const script = ejs.render(hackmdFiles.agentJS, definitions);

    res.set('Content-Type', 'application/javascript');
    res.send(script);
  };

  /**
   * GET /_hackmd/load-styles
   *
   * loadStyles action
   * This should be access from HackMD and send script to insert styles
   *
   * @param {object} req
   * @param {object} res
   */
  const loadStyles = function(req, res) {

    // generate definitions to replace
    const definitions = {
      styles: hackmdFiles.stylesCSS,
    };
    // inject styles to script
    const script = ejs.render(hackmdFiles.stylesJS, definitions);

    res.set('Content-Type', 'application/javascript');
    res.send(script);
  };

  const validateForApi = async function(req, res, next) {
    // validate process.env.HACKMD_URI
    const hackmdUri = process.env.HACKMD_URI;
    if (hackmdUri == null) {
      return res.json(ApiResponse.error('HackMD for GROWI has not been setup'));
    }
    // validate pageId
    const pageId = req.body.pageId;
    if (pageId == null) {
      return res.json(ApiResponse.error('pageId required'));
    }
    // validate page
    const page = await Page.findOne({ _id: pageId });
    if (page == null) {
      return res.json(ApiResponse.error(`Page('${pageId}') does not exist`));
    }

    req.page = page;
    next();
  };

  /**
   * @swagger
   *
   *    /hackmd.integrate:
   *      post:
   *        tags: [Hackmd]
   *        operationId: integrateHackmd
   *        summary: /hackmd.integrate
   *        description: Integrate hackmd
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  page:
   *                    $ref: '#/components/schemas/Hackmd'
   *        responses:
   *          200:
   *            description: Succeeded to integrate HackMD.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    pageIdOnHackmd:
   *                      $ref: '#/components/schemas/Hackmd/properties/pageIdOnHackmd'
   *                    revisionIdHackmdSynced:
   *                      $ref: '#/components/schemas/Hackmd/properties/revisionIdHackmdSynced'
   *                    hasDraftOnHackmd:
   *                      $ref: '#/components/schemas/Hackmd/properties/hasDraftOnHackmd'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * POST /_api/hackmd.integrate
   *
   * Create page on HackMD and start to integrate
   * @param {object} req
   * @param {object} res
   */
  const integrate = async function(req, res) {
    const hackmdUri = process.env.HACKMD_URI_FOR_SERVER || process.env.HACKMD_URI;
    let page = req.page;

    const hackmdPageUri = (page.pageIdOnHackmd != null)
      ? `${hackmdUri}/${page.pageIdOnHackmd}`
      : `${hackmdUri}/new`;

    let hackmdResponse;
    try {
      // check if page is found or created in HackMD
      hackmdResponse = await axios.get(hackmdPageUri, {
        maxRedirects: 0,
        // validate HTTP status is 200 or 302 or 404
        validateStatus: (status) => {
          return status === 200 || status === 302 || status === 404;
        },
      });
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error(err));
    }

    const { status, headers } = hackmdResponse;

    // validate HackMD/CodiMD/HedgeDoc specific header
    if (headers['codimd-version'] == null && headers['hackmd-version'] == null && headers['hedgedoc-version'] == null) {
      const message = 'Connecting to a non-HackMD server.';
      logger.error(message);
      return res.json(ApiResponse.error(message));
    }

    try {
      // when page is not found
      if (status === 404) {
        // reset registered data
        page = await Page.registerHackmdPage(page, undefined);
        // re-invoke
        return integrate(req, res);
      }

      // when redirect
      if (status === 302) {
        // extract page id on HackMD
        const pathnameOnHackmd = new URL(headers.location, hackmdUri).pathname; // e.g. '/NC7bSRraT1CQO1TO7wjCPw'
        const pageIdOnHackmd = pathnameOnHackmd.substr(1); //                      strip the head '/'

        page = await Page.registerHackmdPage(page, pageIdOnHackmd);
      }
      // when page is found
      else {
        page = await Page.syncRevisionToHackmd(page);
      }

      const data = {
        pageIdOnHackmd: page.pageIdOnHackmd,
        revisionIdHackmdSynced: page.revisionHackmdSynced,
        hasDraftOnHackmd: page.hasDraftOnHackmd,
      };
      return res.json(ApiResponse.success(data));
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error('Integration with HackMD process failed'));
    }
  };

  /**
   * @swagger
   *
   *    /hackmd.discard:
   *      post:
   *        tags: [Hackmd]
   *        operationId: discardHackmd
   *        summary: /hackmd.discard
   *        description: Discard hackmd
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  page:
   *                    $ref: '#/components/schemas/Hackmd'
   *        responses:
   *          200:
   *            description: Succeeded to integrate HackMD.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *                    pageIdOnHackmd:
   *                      $ref: '#/components/schemas/Hackmd/properties/pageIdOnHackmd'
   *                    revisionIdHackmdSynced:
   *                      $ref: '#/components/schemas/Hackmd/properties/revisionIdHackmdSynced'
   *                    hasDraftOnHackmd:
   *                      $ref: '#/components/schemas/Hackmd/properties/hasDraftOnHackmd'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * POST /_api/hackmd.discard
   *
   * Create page on HackMD and start to integrate
   * @param {object} req
   * @param {object} res
   */
  const discard = async function(req, res) {
    let page = req.page;

    try {
      page = await Page.syncRevisionToHackmd(page);

      const data = {
        pageIdOnHackmd: page.pageIdOnHackmd,
        revisionIdHackmdSynced: page.revisionHackmdSynced,
        hasDraftOnHackmd: page.hasDraftOnHackmd,
      };
      return res.json(ApiResponse.success(data));
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error('discard process failed'));
    }
  };

  /**
   * @swagger
   *
   *    /hackmd.saveOnHackmd:
   *      post:
   *        tags: [Hackmd]
   *        operationId: saveOnHackmd
   *        summary: /hackmd.saveOnHackmd
   *        description: Receive when save operation triggered on HackMD
   *        requestBody:
   *          content:
   *            application/json:
   *              schema:
   *                properties:
   *                  pageId:
   *                    $ref: '#/components/schemas/Page/properties/_id'
   *                  page:
   *                    $ref: '#/components/schemas/Hackmd'
   *        responses:
   *          200:
   *            description: Succeeded to receive when save operation triggered on HackMD.
   *            content:
   *              application/json:
   *                schema:
   *                  properties:
   *                    ok:
   *                      $ref: '#/components/schemas/V1Response/properties/ok'
   *          403:
   *            $ref: '#/components/responses/403'
   *          500:
   *            $ref: '#/components/responses/500'
   */
  /**
   * POST /_api/hackmd.saveOnHackmd
   *
   * receive when save operation triggered on HackMD
   * !! This will be invoked many time from many people !!
   *
   * @param {object} req
   * @param {object} res
   */
  const saveOnHackmd = async function(req, res) {
    const { page, user } = req;

    try {
      await Page.updateHasDraftOnHackmd(page, true);
      pageEvent.emit('saveOnHackmd', page, user);
      return res.json(ApiResponse.success());
    }
    catch (err) {
      logger.error(err);
      return res.json(ApiResponse.error('saveOnHackmd process failed'));
    }
  };

  return {
    loadAgent,
    loadStyles,
    validateForApi,
    integrate,
    discard,
    saveOnHackmd,
  };
};
