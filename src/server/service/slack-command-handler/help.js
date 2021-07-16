const { markdownSectionBlock } = require('@growi/slack');

module.exports = () => {
  const BaseSlackCommandHandler = require('./slack-command-handler');
  const handler = new BaseSlackCommandHandler();

  handler.handleCommand = (client, body) => {
    const message = '*Help*\n growi-bot usage\n `/growi [command] [args]`\n\n Create new page\n `create`\n\n Search pages\n `search [keyword]`';
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
