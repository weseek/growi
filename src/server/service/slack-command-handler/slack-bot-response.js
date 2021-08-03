const logger = require('@alias/logger')('growi:service:SlackCommandHandler:slack-bot-response');
const { markdownSectionBlock } = require('@growi/slack');
const SlackbotError = require('../../models/vo/slack-bot-error');

module.exports = async function(client, body, callback) {
  const isInteraction = !body.channel_id;
  try {
    await callback();
  }
  catch (err) {
    if (!SlackbotError.isSlackbotError(err)) {
      logger.error(`A non-SlackbotError error occured.\n${err.toString()}`);
      throw err;
    }

    // for both postMessage and postEphemeral
    let toChannel;
    // for only postEphemeral
    let toUser;
    // decide which channel to send to
    switch (err.to) {
      case 'dm':
        toChannel = isInteraction ? JSON.parse(body.payload).user.id : body.user_id;
        toUser = toChannel;
        break;
      case 'channel':
        toChannel = isInteraction ? JSON.parse(body.payload).channel.id : body.channel_id;
        toUser = isInteraction ? JSON.parse(body.payload).user.id : body.user_id;
        break;
      default:
        logger.error('The "to" property of SlackbotError must be "dm" or "channel".');
        break;
    }

    // argumentMap object to pass
    let argumentsMap = {};
    switch (err.method) {
      case 'postMessage':
        argumentsMap = {
          channel: toChannel,
          text: err.popupMessage,
          blocks: [
            markdownSectionBlock(err.mainMessage),
          ],
        };
        break;
      case 'postEphemeral':
        argumentsMap = {
          channel: toChannel,
          user: toUser,
          text: err.popupMessage,
          blocks: [
            markdownSectionBlock(err.mainMessage),
          ],
        };
        break;
      default:
        logger.error('The "method" property of SlackbotError must be "postMessage" or "postEphemeral".');
        break;
    }

    await client.chat[err.method](argumentsMap);
  }
};
