module.exports = function(crowi, app) {
  const path = require('path');
  const swig = require('swig-templates');

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

  return {
    loadAgent,
  };
};
