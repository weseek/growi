import { Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { generateInputSectionBlock, GrowiCommand, generateMarkdownSectionBlock } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';

import { GrowiCommandProcessor } from '~/interfaces/growi-command-processor';


const isProduction = process.env.NODE_ENV === 'production';

@Service()
export class RegisterService implements GrowiCommandProcessor {

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void> {

    const { botToken } = authorizeResult;

    // tmp use process.env
    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });
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
          generateInputSectionBlock('proxyToken', 'PROXY ACCESS_TOKEN', 'contents_input', false, 'jBMZvpk.....'),
        ],
      },
    });
  }

  async sendProxyURL(authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void> {

    const { botToken } = authorizeResult;

    // tmp use process.env
    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });
    await client.chat.postEphemeral({
      channel: body.channel_id,
      user: body.user_id,
      text: 'Hello world',
      blocks: [
        generateMarkdownSectionBlock('hoge1'),
        generateMarkdownSectionBlock('hoge2'),
      ],
    });
    return;
  }

}
