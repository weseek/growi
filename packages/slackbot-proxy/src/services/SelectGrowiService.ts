import { Inject, Service } from '@tsed/di';

import { GrowiCommand, generateWebClient } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';

import { GrowiCommandProcessor } from '~/interfaces/slack-to-growi/growi-command-processor';
import { Installation } from '~/entities/installation';
import { Relation } from '~/entities/relation';
import { RelationRepository } from '~/repositories/relation';


export type SelectedGrowiInformation = {
  relation: Relation,
  growiCommand: GrowiCommand,
  sendCommandBody: any,
}

@Service()
export class SelectGrowiService implements GrowiCommandProcessor {

  @Inject()
  relationRepository: RelationRepository;

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string } & {growiUrisForSingleUse:string[]}): Promise<void> {
    const { botToken } = authorizeResult;

    if (botToken == null) {
      throw new Error('botToken is required.');
    }

    const client = generateWebClient(botToken);

    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'select_growi',
        title: {
          type: 'plain_text',
          text: 'Select GROWI Url',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        private_metadata: JSON.stringify({ body, growiCommand }),

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
              options: body.growiUrisForSingleUse.map((growiUri) => {
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

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handleSelectInteraction(installation:Installation | undefined, payload:any): Promise<SelectedGrowiInformation> {
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
