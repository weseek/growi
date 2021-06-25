import { Service } from '@tsed/di';
import axios from 'axios';

import { GrowiCommand, generateWebClient } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';

import { GrowiCommandProcessor } from '~/interfaces/slack-to-growi/growi-command-processor';
import { RelationRepository } from '~/repositories/relation';
import { Installation } from '~/entities/installation';


@Service()
export class SelectRequestService implements GrowiCommandProcessor {

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string } & {growiUris:string[]}): Promise<void> {
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
              options: body.growiUris.map((growiUri) => {
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
  async forwardRequest(relationRepository:RelationRepository, installation:Installation | undefined, payload:any):Promise<void> {
    const { trigger_id: triggerId } = payload;
    const { state, private_metadata: privateMetadata } = payload?.view;
    const { value: growiUri } = state?.values?.select_growi?.growi_app?.selected_option;

    const parsedPrivateMetadata = JSON.parse(privateMetadata);
    const { growiCommand, body } = parsedPrivateMetadata;

    if (growiCommand == null || body == null) {
      throw new Error('growiCommand and body are required.');
    }

    // ovverride trigger_id
    body.trigger_id = triggerId;

    const relation = await relationRepository.findOne({ installation, growiUri });

    if (relation == null) {
      throw new Error('No relation found.');
    }

    /*
     * forward to GROWI server
     */
    // generate API URL
    const url = new URL('/_api/v3/slack-integration/proxied/commands', relation.growiUri);
    await axios.post(url.toString(), {
      ...body,
      growiCommand,
    }, {
      headers: {
        'x-growi-ptog-tokens': relation.tokenPtoG,
      },
    });
  }

}
