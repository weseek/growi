import axios from 'axios';
import { Inject, Service } from '@tsed/di';
import { MultiStaticSelect } from '@slack/web-api';
import {
  actionsBlock, buttonElement, getActionIdAndCallbackIdFromPayLoad, getInteractionIdRegexpFromCommandName,
  GrowiCommand, GrowiCommandProcessor, GrowiInteractionProcessor, initialInteractionHandledResult,
  inputBlock, InteractionHandledResult, markdownSectionBlock, respond,
} from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { DeleteResult } from 'typeorm';
import { RelationRepository } from '~/repositories/relation';
import { Installation } from '~/entities/installation';
import { InstallationRepository } from '~/repositories/installation';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('slackbot-proxy:services:UnregisterService');

const isProduction = process.env.NODE_ENV === 'production';

@Service()
export class UnregisterService implements GrowiCommandProcessor, GrowiInteractionProcessor<void> {

  @Inject()
  relationRepository: RelationRepository;

  @Inject()
  installationRepository: InstallationRepository;

  shouldHandleCommand(growiCommand: GrowiCommand): boolean {
    return growiCommand.growiCommandType === 'unregister';
  }

  async processCommand(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]: string}): Promise<void> {
    // get growi urls
    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      await respond(growiCommand.responseUrl, {
        text: 'No GROWI found to unregister.',
        blocks: [
          markdownSectionBlock('You haven\'t registered any GROWI to this workspace.'),
          markdownSectionBlock('Send `/growi register` to register.'),
        ],
      });
      return;
    }

    const staticSelectElement: MultiStaticSelect = {
      action_id: 'selectedGrowiUris',
      type: 'multi_static_select',
      placeholder: {
        type: 'plain_text',
        text: 'Select GROWI URLs to unregister',
      },
      options: relations.map((relation) => {
        return {
          text: {
            type: 'plain_text',
            text: relation.growiUri,
          },
          value: relation.growiUri,
        };
      }),
    };

    await respond(growiCommand.responseUrl, {
      text: 'Select GROWI URLs to unregister.',
      blocks: [
        inputBlock(staticSelectElement, 'growiUris', 'GROWI URL to unregister'),
        actionsBlock(
          buttonElement({ text: 'Cancel', actionId: 'unregister:cancel', value: JSON.stringify({}) }),
          buttonElement({
            text: 'Unregister', actionId: 'unregister:unregister', style: 'danger', value: JSON.stringify({}),
          }),
        ),
      ],
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  shouldHandleInteraction(interactionPayload: any): boolean {
    const { actionId, callbackId } = getActionIdAndCallbackIdFromPayLoad(interactionPayload);
    const registerRegexp: RegExp = getInteractionIdRegexpFromCommandName('unregister');
    return registerRegexp.test(actionId) || registerRegexp.test(callbackId);
  }

  async processInteraction(
      // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
      authorizeResult: AuthorizeResult, interactionPayload: any,
  ): Promise<InteractionHandledResult<void>> {
    const { actionId } = getActionIdAndCallbackIdFromPayLoad(interactionPayload);

    const interactionHandledResult: any = initialInteractionHandledResult;
    if (!this.shouldHandleInteraction(interactionPayload)) return interactionHandledResult;

    switch (actionId) {
      case 'unregister:unregister':
        interactionHandledResult.result = await this.handleUnregisterInteraction(authorizeResult, interactionPayload);
        break;
      case 'unregister:cancel':
        interactionHandledResult.result = await this.handleUnregisterCancelInteraction(interactionPayload);
        break;
      default:
        logger.error('This unregister interaction is not implemented.');
        break;
    }
    interactionHandledResult.isTerminated = true;

    return interactionHandledResult as InteractionHandledResult<void>;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handleUnregisterInteraction(authorizeResult: AuthorizeResult, payload: any):Promise<void> {

    const selectedOptions = payload.state?.values?.growiUris?.selectedGrowiUris?.selected_options;
    if (!Array.isArray(selectedOptions)) {
      logger.error('Unregisteration failed: Mulformed object was detected\n');
      await respond(payload.response_url, {
        text: 'Unregistration failed',
        blocks: [
          markdownSectionBlock('Error occurred while unregistering GROWI.'),
        ],
      });
      return;
    }
    const growiUris = selectedOptions.map(selectedOption => selectedOption.value);

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    let installation: Installation | undefined;
    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    }
    catch (err) {
      logger.error('Unregisteration failed:\n', err);
      await respond(payload.response_url, {
        text: 'Unregistration failed',
        blocks: [
          markdownSectionBlock('Error occurred while unregistering GROWI.'),
        ],
      });
      return;
    }

    let deleteResult: DeleteResult;
    try {
      deleteResult = await this.relationRepository.createQueryBuilder('relation')
        .where('relation.growiUri IN (:uris)', { uris: growiUris })
        .andWhere('relation.installationId = :installationId', { installationId: installation?.id })
        .delete()
        .execute();
    }
    catch (err) {
      logger.error('Unregisteration failed\n', err);
      await respond(payload.response_url, {
        text: 'Unregistration failed',
        blocks: [
          markdownSectionBlock('Error occurred while unregistering GROWI.'),
        ],
      });
      return;
    }

    await respond(payload.response_url, {
      text: 'Unregistration completed',
      blocks: [
        markdownSectionBlock(`Unregistered *${deleteResult.affected}* GROWI from this workspace.`),
      ],
    });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handleUnregisterCancelInteraction(payload: any): Promise<void> {
    await axios.post(payload.response_url, {
      delete_original: true,
    });
  }

}
