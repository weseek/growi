import { Inject, Service } from '@tsed/di';
import {
  WebClient, LogLevel, Block, ConversationsSelect,
} from '@slack/web-api';
import {
  markdownSectionBlock, markdownHeaderBlock, inputSectionBlock, GrowiCommand, inputBlock,
  respond, GrowiCommandProcessor, GrowiInteractionProcessor, RequestFromSlack, HandlerName,
  getActionIdAndCallbackIdFromPayLoad, getInteractionIdRegexpFromCommandName, InteractionHandledResult, initialInteractionHandledResult,
} from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { OrderRepository } from '~/repositories/order';
import { InvalidUrlError } from '../models/errors';
import { InstallationRepository } from '~/repositories/installation';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:RegisterService');

const isProduction = process.env.NODE_ENV === 'production';
const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Service()
export class RegisterService implements GrowiCommandProcessor, GrowiInteractionProcessor<void> {

  @Inject()
  orderRepository: OrderRepository;

  @Inject()
  installationRepository: InstallationRepository;

  shouldHandleCommand(growiCommand: GrowiCommand): boolean {
    return growiCommand.growiCommandType === 'register';
  }

  async processCommand(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void> {
    const { botToken } = authorizeResult;

    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });

    const conversationsSelectElement: ConversationsSelect = {
      action_id: 'conversation',
      type: 'conversations_select',
      response_url_enabled: true,
      default_to_current_conversation: true,
    };
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'register:register',
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
        private_metadata: JSON.stringify({ channel: body.channel_name }),

        blocks: [
          inputBlock(conversationsSelectElement, 'conversation', 'Channel to which you want to add'),
          inputSectionBlock('growiUrl', 'GROWI domain', 'contents_input', false, 'https://example.com'),
          inputSectionBlock('tokenPtoG', 'Access Token Proxy to GROWI', 'contents_input', false, 'jBMZvpk.....'),
          inputSectionBlock('tokenGtoP', 'Access Token GROWI to Proxy', 'contents_input', false, 'sdg15av.....'),
        ],
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleInteraction(interactionPayload: any): boolean {
    const { actionId, callbackId } = getActionIdAndCallbackIdFromPayLoad(interactionPayload);
    const registerRegexp: RegExp = getInteractionIdRegexpFromCommandName('register');
    return registerRegexp.test(actionId) || registerRegexp.test(callbackId);
  }

  async processInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, interactionPayload: any,
  ): Promise<InteractionHandledResult<void>> {
    const interactionHandledResult: any = initialInteractionHandledResult;
    if (!this.shouldHandleInteraction(interactionPayload)) return interactionHandledResult;
    interactionHandledResult.result = await this.handleRegisterInteraction(authorizeResult, interactionPayload);
    interactionHandledResult.isTerminate = true;

    return interactionHandledResult as InteractionHandledResult<void>;
  }

  async handleRegisterInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, payload: any,
  ): Promise<void> {
    try {
      await this.insertOrderRecord(authorizeResult, payload);
    }
    catch (err) {
      if (err instanceof InvalidUrlError) {
        logger.error('Failed to register:\n', err);
        await respond(payload.response_urls[0].response_url, {
          text: 'Invalid URL',
          blocks: [
            markdownSectionBlock('Please enter a valid URL'),
          ],
        });
        return;
      }

      logger.error('Error occurred while insertOrderRecord:\n', err);
    }

    await this.notifyServerUriToSlack(payload);
  }

  async insertOrderRecord(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, payload: any,
  ): Promise<void> {
    const inputValues = payload.view.state.values;
    const growiUrl = inputValues.growiUrl.contents_input.value;
    const tokenPtoG = inputValues.tokenPtoG.contents_input.value;
    const tokenGtoP = inputValues.tokenGtoP.contents_input.value;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const url = new URL(growiUrl);
    }
    catch (error) {
      throw new InvalidUrlError(growiUrl);
    }

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);

    this.orderRepository.save({
      installation, growiUrl, tokenPtoG, tokenGtoP,
    });
  }

  async notifyServerUriToSlack(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      payload: any,
  ): Promise<void> {

    const serverUri = process.env.SERVER_URI;

    const blocks: Block[] = [];

    if (isOfficialMode) {
      blocks.push(markdownHeaderBlock(':white_check_mark: 1. Install Official bot to Slack'));
      blocks.push(markdownHeaderBlock(':white_check_mark: 2. Register for GROWI Official Bot Proxy Service'));
      blocks.push(markdownSectionBlock('The request has been successfully accepted. However, registration has *NOT been completed* yet.'));
      blocks.push(markdownHeaderBlock(':arrow_right: 3. Test Connection'));
      blocks.push(markdownSectionBlock('*Test Connection* to complete the registration in your GROWI.'));
      blocks.push(markdownHeaderBlock(':white_large_square: 4. (Opt) Manage GROWI commands'));
      blocks.push(markdownSectionBlock('Modify permission settings if you need.'));
      await respond(payload.response_urls[0].response_url, {
        text: 'Proxy URL',
        blocks,
      });
      return;

    }

    blocks.push(markdownHeaderBlock(':white_check_mark: 1. Create Bot'));
    blocks.push(markdownHeaderBlock(':white_check_mark: 2. Install bot to Slack'));
    blocks.push(markdownHeaderBlock(':white_check_mark: 3. Register for your GROWI Custom Bot Proxy'));
    blocks.push(markdownSectionBlock('The request has been successfully accepted. However, registration has *NOT been completed* yet.'));
    blocks.push(markdownHeaderBlock(':arrow_right: 4. Set Proxy URL on GROWI'));
    blocks.push(markdownSectionBlock('Please enter and update the following Proxy URL to slack bot setting form in your GROWI'));
    blocks.push(markdownSectionBlock(`Proxy URL: ${serverUri}`));
    blocks.push(markdownHeaderBlock(':arrow_right: 5. Test Connection'));
    blocks.push(markdownSectionBlock('And *Test Connection* to complete the registration in your GROWI.'));
    blocks.push(markdownHeaderBlock(':white_large_square: 6. (Opt) Manage GROWI commands'));
    blocks.push(markdownSectionBlock('Modify permission settings if you need.'));
    await respond(payload.response_urls[0].response_url, {
      text: 'Proxy URL',
      blocks,
    });
    return;
  }

}
