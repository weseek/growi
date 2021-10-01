const { markdownSectionBlock, getHelpCommandBody } = require('@growi/slack');
const { respondFromGrowi } = require('./response-url');

module.exports = (crowi, proxyUri, tokenGtoP) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = (growiCommand, client, body) => {
    const helpCommandBody = getHelpCommandBody();
    await respondFromGrowi(growiCommand.responseUrl, proxyUri, tokenGtoP, helpCommandBody);
  };

  return handler;
};
