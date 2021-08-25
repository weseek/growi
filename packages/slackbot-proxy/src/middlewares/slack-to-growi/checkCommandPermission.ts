import {
  IMiddleware, Inject, Middleware, Next, Req, Res,
} from '@tsed/common';
import {
  generateWebClient, markdownSectionBlock, GrowiCommand,
} from '@growi/slack';
import { RelationMock } from '~/entities/relation-mock';

import { RelationsService } from '~/services/RelationsService';
import { InstallerService } from '~/services/InstallerService';
// import { SelectGrowiService } from '~/services/SelectGrowiService';

import { InstallationRepository } from '~/repositories/installation';
import { RelationMockRepository } from '~/repositories/relation-mock';

import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';


@Middleware()
export class checkCommandPermissionMiddleware implements IMiddleware {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  @Inject()
  relationMockRepository: RelationMockRepository;

  @Inject()
  relationsService: RelationsService;


  async use(@Req() req:SlackOauthReq & Request, @Res() res:Res, @Next() next: Next):Promise<void> {
    const { body, authorizeResult } = req;

    let payload:any;
    if (body.payload != null) {
      payload = JSON.parse(req.body.payload);
    }
    // if (req.body.text == null && !payload) { // when /relation-test
    //   return next();
    // }


    let command:string;
    if (body.payload == null) { // when request is to /commands
      command = body.text.split(' ')[0];
      console.log(command);
    }
    else if (payload.actions != null) { // when request is to /interactions && block_actions
      console.log(58);

      const actionId = payload.actions[0].action_id;
      command = actionId.split(':')[0];
    }
    else { // when request is to /interactions && view_submission
      payload = JSON.parse(req.body.payload);

      console.log(49, payload);

      const privateMeta = JSON.parse(payload.view.private_metadata);

      // first payload
      if (privateMeta.body != null) {
        command = privateMeta.body.text.split(' ')[0];
      }
      // second payload
      else {
        console.log(56, payload.view.callback_id);

        command = payload.view.callback_id.split(':')[0];
      }
      console.log(37, command);
    }

    const passCommandArray = ['status', 'register', 'unregister', 'help'];
    console.log(command);

    if (passCommandArray.includes(command)) {
      console.log(22);
      return next();
    }

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationMockRepository.createQueryBuilder('relation_mock')
      .where('relation_mock.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation_mock.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      res.json({
        blocks: [
          markdownSectionBlock('*No relation found.*'),
          markdownSectionBlock('Run `/growi register` first.'),
        ],
      });
      return;
    }
    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    // res.send();

    const baseDate = new Date();

    const isSupportedSingle = await relations.map(async(relation) => {
      await this.relationsService.isSupportedGrowiCommandForSingleUse(relation, command, baseDate);
      return;
    });
    if (isSupportedSingle) return next();


    const isSupportedBroadCast = await relations.map(async(relation) => {
      await this.relationsService.isSupportedGrowiCommandForBroadcastUse(relation, command, baseDate);
      return;
    });
    if (isSupportedBroadCast) return next();

    // check permission at channel level
    const relationMock = await this.relationMockRepository.findOne({ where: { installation } });
    const channelsObject = relationMock?.permittedChannelsForEachCommand.channelsObject;


    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const permittedCommandsForChannel = Object.keys(channelsObject!); // eg. [ 'create', 'search', 'togetter', ... ]
    console.log(112, permittedCommandsForChannel);


    const targetCommand = permittedCommandsForChannel.find(e => e === command);
    console.log(command);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    console.log(118, targetCommand);

    const permittedChannels = channelsObject?.[targetCommand!];
    console.log(permittedChannels);

    let fromChannel:string;
    if (body.channel_name != null) { // commands
      fromChannel = body.channel_name;
    }
    else if (payload.channel.name != null) { // interactions
      fromChannel = payload.channel.name;
    }
    else {
      console.log(payload, 154);

      const privateMeta = JSON.parse(payload.view.private_metadata);
      fromChannel = privateMeta.channelName;

    }

    const isPermittedChannel = permittedChannels?.includes(fromChannel);
    console.log(151, isPermittedChannel);
    if (isPermittedChannel) {
      return next();
    }


    if (payload != null) {
      const isPermittedChannel = permittedChannels?.includes(fromChannel);
      if (isPermittedChannel) {
        return next();
      }
    }

    // send postEphemral message for not permitted
    const botToken = relations[0].installation?.data.bot?.token;


    console.log(179);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const client = generateWebClient(botToken!);
    await client.chat.postEphemeral({
      text: 'Error occured.',
      channel: body.channel_id,
      user: body.user_id,
      blocks: [
        markdownSectionBlock(`It is not allowed to run *'${command}'* command to this GROWI.`),
      ],
    });
    return;

  }

}
