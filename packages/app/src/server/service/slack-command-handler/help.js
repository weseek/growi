const { markdownSectionBlock, respond } = require('@growi/slack');

module.exports = (crowi, proxyUri, tokenGtoP) => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = (growiCommand, client, body, respondUtil) => {
    // adjust spacing
    let message = '*Help*\n\n';
    message += 'Usage:     `/growi [command] [args]`\n\n';
    message += 'Commands:\n\n';
    message += '`/growi create`                          Create new page\n\n';
    message += '`/growi search [keyword]`       Search pages\n\n';
    message += '`/growi togetter`                      Create new page with existing slack conversations (Alpha)\n\n';
    await respondUtil.respond({
      text: 'Help',
      blocks: [
        markdownSectionBlock(message),
      ],
    });
  };

  return handler;
};
