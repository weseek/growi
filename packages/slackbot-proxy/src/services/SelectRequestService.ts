import { Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { GrowiCommand } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { GrowiCommandProcessor } from '~/interfaces/slack-to-growi/growi-command-processor';


const isProduction = process.env.NODE_ENV === 'production';

@Service()
export class SelectRequestService implements GrowiCommandProcessor {

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string } & {growiUris:string[]}): Promise<void> {
    const { botToken } = authorizeResult;

    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'register',
        title: {
          type: 'plain_text',
          text: 'Slect Growi url',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        private_metadata: JSON.stringify({ channel: body.channel_name }),

        blocks: [
          {
            type: 'input',
            block_id: 'select_growi',
            label: {
              type: 'plain_text',
              text: 'GROWI App',
            },
            element: {
              type: 'static_select',
              action_id: 'growi_app',
              options: body.growiUris.map((growiUri) => {
                return ({
                  text: {
                    type: 'plain_text',
                    text: growiUri,
                  },
                  value: growiUri,
                });
              }),
            },
          },
        ],
      },
    });
  }

}
