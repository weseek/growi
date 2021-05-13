import {
  Controller, Get, Inject, Req, Res, UseBefore,
} from '@tsed/common';

import { WebAPICallResult } from '@slack/web-api';

import { verifyGrowiToSlackRequest, getConnectionStatuses } from '@growi/slack';

import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('slackbot-proxy:controllers:growi-to-slack');


@Controller('/g2s')
export class GrowiToSlackCtrl {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  @Inject()
  relationRepository: RelationRepository;

  @Get('/connection-status')
  @UseBefore(verifyGrowiToSlackRequest)
  async getConnectionStatuses(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    // asserted (tokenGtoPs.length > 0) by verifyGrowiToSlackRequest
    const { tokenGtoPs } = req;

    // retrieve Relation with Installation
    const relations = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.tokenGtoP IN (:...tokens)', { tokens: tokenGtoPs })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getMany();

    logger.debug(`${relations.length} relations found`, relations);

    // extract bot token
    const tokens: string[] = relations
      .map(relation => relation.installation?.data?.bot?.token)
      .filter((v): v is string => v != null); // filter out null values

    const connectionStatuses = await getConnectionStatuses(tokens);

    return res.send({ connectionStatuses });
  }

}
