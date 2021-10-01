import assert from 'assert';
import { ChatPostEphemeralResponse, WebClient } from '@slack/web-api';

import { markdownSectionBlock, respond } from '@growi/slack';

import loggerFactory from '~/utils/logger';

import { SlackbotError } from '../../models/vo/slackbot-error';

const logger = loggerFactory('growi:service:SlackCommandHandler:error-handler');


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleErrorWithWebClient(error: Error, client: WebClient, body: any): Promise<ChatPostEphemeralResponse> {

  const isInteraction = !body.channel_id;

  // this method is expected to use when system couldn't response_url
  assert(!(error instanceof SlackbotError) || error.responseUrl == null);

  const payload = JSON.parse(body.payload);

  const channel = isInteraction ? payload.channel.id : body.channel_id;
  const user = isInteraction ? payload.user.id : body.user_id;

  return client.chat.postEphemeral({
    channel,
    user,
    text: error.message,
    blocks: [
      markdownSectionBlock(`*GROWI Internal Server Error occured.*\n${error.message}`),
    ],
  });
}


export async function handleError(error: SlackbotError, responseUrl?: string): Promise<void>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleError(error: Error, client: WebClient, body: any): Promise<ChatPostEphemeralResponse>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function handleError(error: SlackbotError | Error, ...args: any[]): Promise<void|ChatPostEphemeralResponse> {
  if (error instanceof SlackbotError && typeof args[0] === 'string') {
    const responseUrl = args[0] || error.responseUrl;
    if (responseUrl == null) {
      logger.error('Specify responseUrl.');
      return;
    }
    return respond(responseUrl, error.respondBody);
  }

  assert(args[0] instanceof WebClient);

  return handleErrorWithWebClient(error, args[0], args[1]);
}


// module.exports = { respondIfSlackbotError };
