import { registerService, Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { generateInputSectionBlock } from '@growi/slack/src/utils/block-creater';

@Service()
export class RegisterService {

  async registerService(body:{[key:string]:string}):Promise<void> {
    // tmp use process.env
    const client = new WebClient(process.env.SLACK_BOT_USER_OAUTH_TOKEN, { logLevel: LogLevel.DEBUG });
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Register Credentials',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          generateInputSectionBlock('growiDomain', 'GROWI domain', 'contents_input', false, 'https://example.com'),
          generateInputSectionBlock('growiAccessToken', 'GROWI ACCESS_TOKEN', 'contents_input', false, 'jBMZvpk.....'),
          generateInputSectionBlock('proxyToken', 'PROXY ACCESS_TOKEM', 'contents_input', false, 'jBMZvpk.....'),
        ],
      },
    });
  }

  get registerServiceHoge() {
    return this.registerService;
  }

}
