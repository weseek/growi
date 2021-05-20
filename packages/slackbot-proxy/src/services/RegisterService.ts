import { Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { generateInputSectionBlock, GrowiCommand, generateMarkdownSectionBlock } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { GrowiCommandProcessor } from '~/interfaces/slack-to-growi/growi-command-processor';
import { OrderRepository } from '~/repositories/order';
import { Installation } from '~/entities/installation';

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
          // added an input block to make response_url enabled and get info (block_id, action_id, channel_id, response_url)
          // refer to https://api.slack.com/surfaces/modals/using#modal_response_url
          {
            block_id: 'channel_to_post_proxy_url',
            type: 'input',
            label: {
              type: 'plain_text',
              text: 'Select a channel to post the proxy URL on',
            },
            element: {
              action_id: 'submit_growi_url_and_access_tokens',
              type: 'conversations_select',
              response_url_enabled: true,
              default_to_current_conversation: true,
            },
          },
        ],
      },
    });
  }

  async upsertOrderRecord(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      orderRepository: OrderRepository, installation: Installation | undefined, payload: any,
  ): Promise<void> {
    const inputValues = payload.view.state.values;
    const inputGrowiUrl = inputValues.growiDomain.contents_input.value;
    const inputGrowiAccessToken = inputValues.growiAccessToken.contents_input.value;
    const inputProxyAccessToken = inputValues.proxyToken.contents_input.value;

    const order = await orderRepository.findOne({ installation, growiUrl: inputGrowiUrl });
    if (order != null) {
      orderRepository.update(
        { installation, growiUrl: inputGrowiUrl },
        { growiAccessToken: inputGrowiAccessToken, proxyAccessToken: inputProxyAccessToken },
      );
    }
    else {
      orderRepository.save({
        installation, growiUrl: inputGrowiUrl, growiAccessToken: inputGrowiAccessToken, proxyAccessToken: inputProxyAccessToken,
      });
    }
  }

  async notifyServerUriToSlack(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult:AuthorizeResult, payload: any,
  ): Promise<void> {

    const { botToken } = authorizeResult;

    const serverUri = process.env.SERVER_URI;

    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });

    await client.chat.postEphemeral({
      channel: payload.response_urls[0].channel_id,
      user: payload.user.id,
      // Recommended including 'text' to provide a fallback when using blocks
      // refer to https://api.slack.com/methods/chat.postEphemeral#text_usage
      text: 'Proxy URL',
      blocks: [
        generateMarkdownSectionBlock('Please enter and update the following Proxy URL to slack bot setting form in your GROWI'),
        generateMarkdownSectionBlock(`Proxy URL: ${serverUri}`),
      ],
    });
    return;
  }

}
