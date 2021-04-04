import { WebClient, LogLevel } from '@slack/web-api';
import { parse } from '../utils/slash-command-parser';


export const openModal = async(body) => {

  const client = new WebClient('', { logLevel: LogLevel.DEBUG });

  await client.views.open({
    trigger_id: body.trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'My App',
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
            text: 'About',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: 'Psssst',
            },
          ],
        },
      ],
    },
  });

  console.log('openModal');
};
