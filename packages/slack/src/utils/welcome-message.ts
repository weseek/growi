import { ChatPostMessageResponse, WebClient } from '@slack/web-api';

export const postWelcomeMessage = (client: WebClient, userId: string): Promise<ChatPostMessageResponse> => {
  return client.chat.postMessage({
    channel: userId,
    user: userId,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: ':tada: You have successfully installed GROWI Official bot on this Slack workspace.\n'
            + 'At first you do `/growi register` in the channel that you want to use.\n'
            + 'Looking for additional help?'
            // eslint-disable-next-line max-len
            + 'See <https://docs.growi.org/en/admin-guide/management-cookbook/slack-integration/official-bot-settings.html#official-bot-settings | Docs>.',
        },
      },
    ],
  });
};
