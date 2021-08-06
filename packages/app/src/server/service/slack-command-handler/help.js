const { markdownSectionBlock } = require('@growi/slack');

module.exports = () => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = (client, body) => {
    // adjust spacing
    let message = '*Help*\n\n';
    message += 'Usage:     `/growi [command] [args]`\n\n';
    message += 'Commands:\n\n';
    message += '`/growi create`                          Create new page\n\n';
    message += '`/growi search [keyword]`       Search pages\n\n';
    message += '`/growi togetter`                      Create new page with existing slack conversations\n\n';
    client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Help',
      blocks: [
        markdownSectionBlock(message),
      ],
    });
  };

  return handler;
};
