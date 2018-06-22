module.exports = function(crowi, app) {
  const path = require('path');
  const fs = require('graceful-fs');

  // load GROWI agent script for HackMD
  const manifest = require(path.join(crowi.publicDir, 'manifest.json'));
  const agentScriptPath = path.join(crowi.publicDir, manifest['js/agent-for-hackmd.js']);
  const agentScriptContent = fs.readFileSync(agentScriptPath, 'utf8').toString();

  /**
   * loadAgent action
   * This should be access from HackMD and send agent script
   *
   * @param {object} req
   * @param {object} res
   */
  const loadAgent = function(req, res) {
    res.set('Content-Type', 'application/javascript');
    res.send(agentScriptContent);
  };

  return {
    loadAgent,
  };
};
