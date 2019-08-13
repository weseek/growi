/* eslint-disable no-use-before-define */

const logger = require('@alias/logger')('growi:routes:hackmd');
const path = require('path');
const fs = require('graceful-fs');
const swig = require('swig-templates');
const axios = require('axios');

const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const Page = crowi.models.Page;
  const pageEvent = crowi.event('page');

  // load GROWI agent script for HackMD
  const manifest = require(path.join(crowi.publicDir, 'manifest.json'));
  const agentScriptPath = path.join(crowi.publicDir, manifest['js/hackmd-agent.js']);
  const stylesScriptPath = path.join(crowi.publicDir, manifest['js/hackmd-styles.js']);
  // generate swig template
  let agentScriptContentTpl;
  let stylesScriptContentTpl;

  // init 'saveOnHackmd' event
  pageEvent.on('saveOnHackmd', (page) => {
    crowi.getIo().sockets.emit('page:editingWithHackmd', { page });
  });

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
    // generate swig template
    if (agentScriptContentTpl == null) {
      agentScriptContentTpl = swig.compileFile(agentScriptPath);
    }

    const origin = crowi.appService.getSiteUrl();

    // generate definitions to replace
    const definitions = {
      origin,
    };
    // inject
    const script = agentScriptContentTpl(definitions);

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
    // generate swig template
    if (stylesScriptContentTpl == null) {
      stylesScriptContentTpl = swig.compileFile(stylesScriptPath);
    }

    const styleFilePath = path.join(crowi.publicDir, manifest['styles/style-hackmd.css']);
    const styles = fs
      .readFileSync(styleFilePath).toString()
      .replace(/\s+/g, ' ');

    // generate definitions to replace
    const definitions = {
      styles: escape(styles),
    };
    // inject
    const script = stylesScriptContentTpl(definitions);

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

    // validate HackMD/CodiMD specific header
    if (headers['codimd-version'] == null && headers['hackmd-version'] == null) {
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
        const pagePathOnHackmd = headers.location; // e.g. '/NC7bSRraT1CQO1TO7wjCPw'
        const pageIdOnHackmd = pagePathOnHackmd.substr(1); //        strip the head '/'

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
   * POST /_api/hackmd.saveOnHackmd
   *
   * receive when save operation triggered on HackMD
   * !! This will be invoked many time from many people !!
   *
   * @param {object} req
   * @param {object} res
   */
  const saveOnHackmd = async function(req, res) {
    const page = req.page;

    try {
      await Page.updateHasDraftOnHackmd(page, true);
      pageEvent.emit('saveOnHackmd', page);
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
