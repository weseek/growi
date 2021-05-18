import {
  Controller, Get, Inject, Req, Res, UseBefore,
} from '@tsed/common';

import { WebAPICallResult } from '@slack/web-api';

import { verifyGrowiToSlackRequest, getConnectionStatuses, authTestByToken } from '@growi/slack';

import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';
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

  @Inject()
  orderRepository: OrderRepository;

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

  @Get('/relation-test')
  @UseBefore(verifyGrowiToSlackRequest)
  async postRelation(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    // asserted (tokenGtoPs.length > 0) by verifyGrowiToSlackRequest
    const { tokenGtoP } = req;

    // retrieve relation with Installation
    const relation = await this.relationRepository.createQueryBuilder('relation')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    if (relation != null) {
      const token = relation.installation.data.bot?.token;
      if (token == null) {
        return res.status(400).send({ message: 'installation is invalid' });
      }
      try {
        await authTestByToken(token);
      }
      catch (error) {
        return res.status(500).send({ message: 'installation is invalid' });
      }
    }

    // retrieve latest Order with Installation
    const order = await this.orderRepository.createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .where('growiAccessToken = :token', { token: tokenGtoP })
      .leftJoinAndSelect('order.installation', 'installation')
      .getOne();

    console.log(order);


    // if (order == null || order.isExpired()) {
    //   return 'order has expired or does not exist.';
    // }

    // logger.debug('order found', order);

    // const token = order.installation?.data?.bot?.token;
    // if (token == null) {
    //   return 'token does not exist.';
    // }

    // const connectionStatuses = await getConnectionStatuses([token]);
    // if (connectionStatuses[token].workspaceName == null) {
    //   return 'connection test failed.';
    // }

    // logger.debug('retrieve WS name', connectionStatuses[token].workspaceName);

    // TODO GW-5864 issue relation
    // try {
    //   await authTestByToken(token);
    // }
    // catch (error) {
    //   console.log(error);
    // }
    return res.send({ tokenGtoP });
  }

}
