import { Inject, Service } from '@tsed/di';

import {
  getInteractionIdRegexpFromCommandName,
  GrowiCommand, GrowiCommandProcessor, GrowiInteractionProcessor,
  InteractionHandledResult, markdownSectionBlock, replaceOriginal, respond,
} from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { InteractionPayloadAccessor } from '@growi/slack/src/utils/interaction-payload-accessor';

import { Installation } from '~/entities/installation';
import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';
import { InstallationRepository } from '~/repositories/installation';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:UnregisterService');

export type SelectGrowiCommandBody = {
  growiUrisForSingleUse: string[],
}

type SelectValue = {
  growiCommand: GrowiCommand,
  growiUri: any,
  sendCommandBody: any,
}

export type SelectedGrowiInformation = {
  relation: Relation,
  growiCommand: GrowiCommand,
  sendCommandBody: any,
}

@Service()
export class SelectGrowiService implements GrowiCommandProcessor<SelectGrowiCommandBody | null>, GrowiInteractionProcessor<SelectedGrowiInformation> {

  @Inject()
  relationRepository: RelationRepository;

  @Inject()
  installationRepository: InstallationRepository;

  private generateGrowiSelectValue(growiCommand: GrowiCommand, growiUri: string, sendCommandBody: any): SelectValue {
    return {
      growiCommand,
      growiUri,
      sendCommandBody,
    };
  }

  shouldHandleCommand(): boolean {
    // TODO: consider to use the default supported commands for single use
    return true;
  }

  async processCommand(
      growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, context: SelectGrowiCommandBody,
  ): Promise<void> {
    const growiUrls = context.growiUrisForSingleUse;

    const chooseSection = growiUrls.map((growiUri) => {
      const value = this.generateGrowiSelectValue(growiCommand, growiUri, context);
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
  shouldHandleInteraction(interactionPayloadAccessor: InteractionPayloadAccessor): boolean {
    const { actionId, callbackId } = interactionPayloadAccessor.getActionIdAndCallbackIdFromPayLoad();
    const registerRegexp: RegExp = getInteractionIdRegexpFromCommandName('select_growi');
    return registerRegexp.test(actionId) || registerRegexp.test(callbackId);
  }

  async processInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, interactionPayload: any, interactionPayloadAccessor: InteractionPayloadAccessor,
  ): Promise<InteractionHandledResult<SelectedGrowiInformation>> {
    const interactionHandledResult: InteractionHandledResult<SelectedGrowiInformation> = {
      isTerminated: false,
    };
    if (!this.shouldHandleInteraction(interactionPayloadAccessor)) return interactionHandledResult;

    const selectGrowiInformation = await this.handleSelectInteraction(authorizeResult, interactionPayload, interactionPayloadAccessor);
    if (selectGrowiInformation != null) {
      interactionHandledResult.result = selectGrowiInformation;
    }
    interactionHandledResult.isTerminated = false;

    return interactionHandledResult as InteractionHandledResult<SelectedGrowiInformation>;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handleSelectInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, interactionPayload: any, interactionPayloadAccessor: InteractionPayloadAccessor,
  ): Promise<SelectedGrowiInformation | null> {
    const { trigger_id: triggerId } = interactionPayload;
    const responseUrl = interactionPayloadAccessor.getResponseUrl();

    const selectGrowiValue = interactionPayloadAccessor.firstAction()?.value;
    if (selectGrowiValue == null) {
      logger.error('Growi command failed: growiCommand and body params are required in private_metadata.');
      await respond(responseUrl, {
        text: 'Growi command failed',
        blocks: [
          markdownSectionBlock('Error occurred while processing GROWI command.'),
        ],
      });
      return null;
    }
    const { growiUri, growiCommand } = JSON.parse(selectGrowiValue);

    const { sendCommandBody } = JSON.parse(selectGrowiValue);

    if (growiCommand == null || sendCommandBody == null) {
      logger.error('Growi command failed: growiCommand and body params are required in private_metadata.');
      await respond(responseUrl, {
        text: 'Growi command failed',
        blocks: [
          markdownSectionBlock('Error occurred while processing GROWI command.'),
        ],
      });
      return null;
    }

    await replaceOriginal(responseUrl, {
      text: `Accepted ${growiCommand.growiCommandType} command.`,
      blocks: [
        markdownSectionBlock(`Processing your request *"/growi ${growiCommand.growiCommandType}"* on GROWI at ${growiUri} ...`),
      ],
    });

    // override trigger_id
    sendCommandBody.trigger_id = triggerId;

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    let installation: Installation | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    }
    catch (err) {
      logger.error('Growi command failed: No installation found.\n', err);
      await respond(responseUrl, {
        text: 'Growi command failed',
        blocks: [
          markdownSectionBlock('Error occurred while processing GROWI command.'),
        ],
      });
      return null;
    }

    const relation = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.growiUri =:growiUri', { growiUri })
      .andWhere('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    if (relation == null) {
      logger.error('Growi command failed: No installation found.');
      await respond(responseUrl, {
        text: 'Growi command failed',
        blocks: [
          markdownSectionBlock('Error occurred while processing GROWI command.'),
        ],
      });
      return null;
    }

    return {
      relation,
      growiCommand,
      sendCommandBody,
    };
  }

}
