const logger = require('@alias/logger')('growi:routes:hackmd');
const path = require('path');
const swig = require('swig-templates');
const axios = require('axios');

const ApiResponse = require('../util/apiResponse');

module.exports = function(crowi, app) {
  const Page = crowi.models.Page;

  // load GROWI agent script for HackMD
  const manifest = require(path.join(crowi.publicDir, 'manifest.json'));
  const agentScriptPath = path.join(crowi.publicDir, manifest['js/agent-for-hackmd.js']);
  // generate swig template
  let agentScriptContentTpl = undefined;


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

    const origin = `${req.protocol}://${req.get('host')}`;
    const styleFilePath = origin + manifest['styles/style-hackmd.css'];

    // generate definitions to replace
    const definitions = {
      origin,
      styleFilePath,
    };
    // inject
    const script = agentScriptContentTpl(definitions);

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
    const hackmdUri = process.env.HACKMD_URI;
    let page = req.page;

    if (page.pageIdOnHackmd != null) {
      try {
        // check if page exists in HackMD
        await axios.get(`${hackmdUri}/${page.pageIdOnHackmd}`);
      }
      catch (err) {
        // reset if pages doesn't exist
        page.pageIdOnHackmd = undefined;
      }
    }

    try {
      if (page.pageIdOnHackmd == null) {
        page = await createNewPageOnHackmdAndRegister(hackmdUri, page);
      }
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
      return res.json(ApiResponse.error(err));
    }
  };

  async function createNewPageOnHackmdAndRegister(hackmdUri, page) {
    // access to HackMD and create page
    const response = await axios.get(`${hackmdUri}/new`);
    logger.debug('HackMD responds', response);

    // extract page id on HackMD
    const pagePathOnHackmd = response.request.path;     // e.g. '/NC7bSRraT1CQO1TO7wjCPw'
    const pageIdOnHackmd = pagePathOnHackmd.substr(1);  // strip the head '/'

    return Page.registerHackmdPage(page, pageIdOnHackmd);
  }

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
      return res.json(ApiResponse.success());
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  return {
    loadAgent,
    validateForApi,
    integrate,
    saveOnHackmd,
  };
};
