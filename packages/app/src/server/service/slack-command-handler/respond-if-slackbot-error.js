import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:SlackCommandHandler:slack-bot-response');
const { markdownSectionBlock } = require('@growi/slack');
const SlackbotError = require('../../models/vo/slackbot-error');

async function respondIfSlackbotError(client, body, err) {
  // check if the request is to /commands OR /interactions
  const isInteraction = !body.channel_id;

  // throw non-SlackbotError
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

  // argumentObj object to pass to postMessage OR postEphemeral
  let argumentsObj = {};
  switch (err.method) {
    case 'postMessage':
      argumentsObj = {
        channel: toChannel,
        text: err.popupMessage,
        blocks: [
          markdownSectionBlock(err.mainMessage),
        ],
      };
      break;
    case 'postEphemeral':
      argumentsObj = {
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

  await client.chat[err.method](argumentsObj);
}

module.exports = { respondIfSlackbotError };
