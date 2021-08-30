import { Inject, Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { GrowiCommand, markdownSectionBlock } from '@growi/slack';
import { AuthorizeResult } from '@slack/oauth';
import { GrowiCommandProcessor } from '~/interfaces/slack-to-growi/growi-command-processor';
import { RelationRepository } from '~/repositories/relation';
import { Installation } from '~/entities/installation';

const isProduction = process.env.NODE_ENV === 'production';

@Service()
export class UnregisterService implements GrowiCommandProcessor {

  @Inject()
  relationRepository: RelationRepository;

  async process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void> {
    const { botToken } = authorizeResult;
    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });
    const growiUrls = growiCommand.growiCommandArgs;
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        callback_id: 'unregister',
        title: {
          type: 'plain_text',
          text: 'Unregister Credentials',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        private_metadata: JSON.stringify({ channel: body.channel_name, growiUrls }),

        blocks: [
          ...growiUrls.map(growiCommandArg => markdownSectionBlock(`GROWI url: ${growiCommandArg}.`)),
        ],
      },
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async unregister(installation: Installation | undefined, authorizeResult: AuthorizeResult, payload: any):Promise<void> {
    const { botToken } = authorizeResult;
    const { channel, growiUrls } = JSON.parse(payload.view.private_metadata);
    const client = new WebClient(botToken, { logLevel: isProduction ? LogLevel.DEBUG : LogLevel.INFO });

    const deleteResult = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.growiUri IN (:uris)', { uris: growiUrls })
      .andWhere('relation.installationId = :installationId', { installationId: installation?.id })
      .delete()
      .execute();

    await client.chat.postEphemeral({
      channel,
      user: payload.user.id,
      // Recommended including 'text' to provide a fallback when using blocks
      // refer to https://api.slack.com/methods/chat.postEphemeral#text_usage
      text: 'Delete Relations',
      blocks: [
        markdownSectionBlock(`Deleted ${deleteResult.affected} Relations.`),
      ],
    });

    return;

  }


}
