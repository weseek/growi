import { Inject, Service } from '@tsed/di';

import {
  getActionIdAndCallbackIdFromPayLoad,
  getInteractionIdRegexpFromCommandName,
  GrowiCommand, GrowiCommandProcessor, GrowiInteractionProcessor, initializeInteractionHandledResult, InteractionHandledResult, markdownSectionBlock, respond,
} from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';

import { Installation } from '~/entities/installation';
import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';
import { InstallationRepository } from '~/repositories/installation';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:UnregisterService');


type SelectValue = {
  growiCommand: GrowiCommand,
  growiUri: any,
}

export type SelectedGrowiInformation = {
  relation: Relation,
  growiCommand: GrowiCommand,
  sendCommandBody: any,
}

@Service()
export class SelectGrowiService implements GrowiCommandProcessor, GrowiInteractionProcessor<SelectedGrowiInformation> {

  @Inject()
  relationRepository: RelationRepository;

  @Inject()
  installationRepository: InstallationRepository;

  private generateGrowiSelectValue(growiCommand: GrowiCommand, growiUri: string): SelectValue {
    return {
      growiCommand,
      growiUri,
    };
  }

  shouldHandleCommand(growiCommand: GrowiCommand): boolean {
    return true;
  }

  async processCommand(
      growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string } & {growiUrisForSingleUse:string[]},
  ): Promise<void> {
    const growiUrls = body.growiUrisForSingleUse;

    const chooseSection = growiUrls.map((growiUri) => {
      const value = this.generateGrowiSelectValue(growiCommand, growiUri);
      return ({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: growiUri,
        },
        accessory: {
          type: 'button',
          action_id: 'select_growi:select_growi',
          text: {
            type: 'plain_text',
            text: 'Choose',
          },
          value: JSON.stringify(value),
        },
      });
    });

    return respond(growiCommand.responseUrl, {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Select target GROWI',
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Request: \`/growi ${growiCommand.text}\` to:`,
            },
          ],
        },
        {
          type: 'divider',
        },
        ...chooseSection,
      ],
    });

  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleInteraction(interactionPayload: any): boolean {
    const { actionId, callbackId } = getActionIdAndCallbackIdFromPayLoad(interactionPayload);
    const registerRegexp: RegExp = getInteractionIdRegexpFromCommandName('select_growi');
    return registerRegexp.test(actionId) || registerRegexp.test(callbackId);
  }

  async processInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, interactionPayload: any,
  ): Promise<InteractionHandledResult<SelectedGrowiInformation>> {
    const interactionHandledResult: any = initializeInteractionHandledResult();
    if (!this.shouldHandleInteraction(interactionPayload)) return interactionHandledResult;
    interactionHandledResult.result = await this.handleSelectInteraction(authorizeResult, interactionPayload);
    interactionHandledResult.isTerminate = false;

    return interactionHandledResult as InteractionHandledResult<SelectedGrowiInformation>;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handleSelectInteraction(authorizeResult: AuthorizeResult, payload:any): Promise<SelectedGrowiInformation> {
    const { trigger_id: triggerId } = payload;
    const { state, private_metadata: privateMetadata } = payload?.view;
    const { value: growiUri } = state?.values?.select_growi?.growi_app?.selected_option;

    const parsedPrivateMetadata = JSON.parse(privateMetadata);
    const { growiCommand, body: sendCommandBody } = parsedPrivateMetadata;

    if (growiCommand == null || sendCommandBody == null) {
      // TODO: postEphemeralErrors
      throw new Error('growiCommand and body params are required in private_metadata.');
    }

    // ovverride trigger_id
    sendCommandBody.trigger_id = triggerId;

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    let installation: Installation | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    }
    catch (err) {
      logger.error('Growi command failed:\n', err);
      await respond(payload.response_url, {
        text: 'Growi command failed',
        blocks: [
          markdownSectionBlock('Error occurred while processing GROWI command.'),
        ],
      });
      throw new Error('No installation found.');
    }

    const relation = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.growiUri =:growiUri', { growiUri })
      .andWhere('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    if (relation == null) {
      // TODO: postEphemeralErrors
      throw new Error('No relation found.');
    }

    return {
      relation,
      growiCommand,
      sendCommandBody,
    };
  }

}
