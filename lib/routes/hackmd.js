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
  const agentScriptContentTpl = swig.compileFile(agentScriptPath);


  /**
   * loadAgent action
   * This should be access from HackMD and send agent script
   *
   * @param {object} req
   * @param {object} res
   */
  const loadAgent = function(req, res) {
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

  /**
   * Create page on HackMD and start to integrate
   * @param {object} req
   * @param {object} res
   */
  const integrate = async function(req, res) {
    // validate process.env.HACKMD_URI
    const hackMdUri = process.env.HACKMD_URI;
    if (hackMdUri == null) {
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
    if (page.pageIdOnHackmd != null) {
      return res.json(ApiResponse.error(`'pageIdOnHackmd' of the page '${page.path}' is not empty`));
    }

    // access to HackMD and create page
    const response = await axios.get(`${hackMdUri}/new`);
    logger.debug('HackMD responds', response);

    // extract page id on HackMD
    const pagePathOnHackmd = response.request.path;     // e.g. '/NC7bSRraT1CQO1TO7wjCPw'
    const pageIdOnHackmd = pagePathOnHackmd.substr(1);  // strip the head '/'

    // persist
    try {
      await Page.registerHackmdPage(page, pageIdOnHackmd);

      const data = {
        pageIdOnHackmd,
      };
      return res.json(ApiResponse.success(data));
    }
    catch (err) {
      return res.json(ApiResponse.error(err));
    }
  };

  return {
    loadAgent,
    integrate,
  };
};
