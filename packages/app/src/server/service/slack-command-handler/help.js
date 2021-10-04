const { markdownSectionBlock, getHelpCommandBody } = require('@growi/slack');

module.exports = () => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = (growiCommand, client, body, respondUtil) => {
    await respondUtil.respond(getHelpCommandBody());
  };

  return handler;
};
