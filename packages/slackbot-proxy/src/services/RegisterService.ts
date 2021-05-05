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
          {
            block_id: 'channel_to_post_proxy_url',
            type: 'input',
            label: {
              type: 'plain_text',
              text: 'Select a channel to post the proxy URL on',
            },
            element: {
              action_id: 'post_proxy_url_id',
              type: 'conversations_select',
              response_url_enabled: true,
              default_to_current_conversation: true,
            },
          },
        ],
      },
    });
  }

  async sendProxyURL(authorizeResult: AuthorizeResult, payload :any): Promise<void> {
    let proxyURL;
    if (process.env.PROXY_URL != null) {
      proxyURL = process.env.PROXY_URL;
    }

    const { botToken } = authorizeResult;

    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });

    await client.chat.postEphemeral({
      channel: payload.response_urls[0].channel_id,
      user: payload.user.id,
      // Recommended to include text to provide a fallback when using blocks
      // https://api.slack.com/methods/chat.postEphemeral#text_usage
      text: 'Proxy URL',
      blocks: [
        generateMarkdownSectionBlock('Please enter and update the following Proxy URL to slack bot setting form in your GROWI'),
        generateMarkdownSectionBlock(`Proxy URL: ${proxyURL}`),
      ],
    });
    return;
  }

}
