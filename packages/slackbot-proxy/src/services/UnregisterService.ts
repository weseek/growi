import axios from 'axios';
import { Inject, Service } from '@tsed/di';
import { MultiStaticSelect } from '@slack/web-api';
import {
  actionsBlock,
  buttonElement,
  GrowiCommand, GrowiCommandProcessor, inputBlock, markdownSectionBlock, respond,
} from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { RelationRepository } from '~/repositories/relation';
import { Installation } from '~/entities/installation';
import { Relation } from '~/entities/relation';
import { InstallationRepository } from '~/repositories/installation';

const isProduction = process.env.NODE_ENV === 'production';

@Service()
export class UnregisterService implements GrowiCommandProcessor {

  @Inject()
  relationRepository: RelationRepository;

  @Inject()
  installationRepository: InstallationRepository;

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]: string}): Promise<void> {
    // get growi urls
    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getMany();

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
          buttonElement({ text: 'Cancel', actionId: 'unregister:cancel', value: JSON.stringify({ dummy: 'DUMMY' }) }),
          buttonElement({
            text: 'Unregister', actionId: 'unregister', style: 'danger', value: JSON.stringify({ dummy: 'DUMMY' }),
          }),
        ),
      ],
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async unregister(installation: Installation | undefined, authorizeResult: AuthorizeResult, payload: any):Promise<void> {

    const growiUris = payload.state.values.growiUris.selectedGrowiUris.selected_options
      .map(selectedOption => selectedOption.value);

    const deleteResult = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.growiUri IN (:uris)', { uris: growiUris })
      .andWhere('relation.installationId = :installationId', { installationId: installation?.id })
      .delete()
      .execute();

    await respond(payload.response_url, {
      text: 'Unregistration completed',
      blocks: [
        markdownSectionBlock(`Unregistered *${deleteResult.affected}* GROWI from this workspace.`),
      ],
    });
    return;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async cancel(payload: any): Promise<void> {
    console.log('あんのか', payload.response_url);

    await axios.post(payload.response_url, {
      delete_original: true,
    });
  }

}
