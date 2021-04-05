import { WebClient, LogLevel } from '@slack/web-api';

export const openRegisterModal = async(body:{[key:string]:string}) : Promise<void> => {

  const client = new WebClient('', { logLevel: LogLevel.DEBUG });
  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Register Credential',
      },
      close: {
        type: 'plain_text',
        text: 'Close',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'hoge',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'fuga',
            },
          ],
        },
      ],
    },
  });
};
