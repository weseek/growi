import {
  IMiddleware, Inject, Middleware, Next, Req, Res,
} from '@tsed/common';
import { parseSlashCommand } from '@growi/slack';
import { RelationMock } from '~/entities/relation-mock';

import { RelationsService } from '~/services/RelationsService';
import { InstallerService } from '~/services/InstallerService';
import { SelectGrowiService } from '~/services/SelectGrowiService';

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

    console.log(12, body);
    console.log(authorizeResult);

    const growiCommand = parseSlashCommand(body);
    console.log(growiCommand);

    const passCommandArray = ['status', 'register', 'unregister', 'help'];

    if (passCommandArray.includes(growiCommand.growiCommandType)) {
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
      // return res.json({
      //   blocks: [
      //     markdownSectionBlock('*No relation found.*'),
      //     markdownSectionBlock('Run `/growi register` first.'),
      //   ],
      // });
    }
    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const baseDate = new Date();

    // const relationsForSingleUse:RelationMock[] = [];
    await Promise.all(relations.map(async(relation) => {
      const isSupported = await this.relationsService.isSupportedGrowiCommandForSingleUse(relation, growiCommand.growiCommandType, baseDate);
      if (isSupported) {
        console.log(75);
        return next();
      }
    }));

    // const relationsForBroadcastUse:RelationMock[] = [];
    await Promise.all(relations.map(async(relation) => {
      const isSupported = await this.relationsService.isSupportedGrowiCommandForBroadcastUse(relation, growiCommand.growiCommandType, baseDate);
      if (isSupported) {
        console.log(85);
        return next();
      }
    }));

    // check permission at channel level
    const relationMock = await this.relationMockRepository.findOne({ where: { installation } });
    const channelsObject = relationMock?.permittedChannelsForEachCommand.channelsObject;

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const permittedCommandsForChannel = Object.keys(channelsObject!); // eg. [ 'create', 'search', 'togetter', ... ]

    const targetCommand = permittedCommandsForChannel.find(e => e === growiCommand.growiCommandType);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const permittedChannels = channelsObject![targetCommand!];
    const fromChannel = body.channel_name;
    const isPermittedChannel = permittedChannels.includes(fromChannel);

    if (isPermittedChannel) {
      console.log(104);
      return next();
    }

    console.log(108);

  }


}
