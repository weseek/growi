import {
  Controller, Get, Inject, Req, Res, UseBefore,
} from '@tsed/common';

import { WebAPICallResult } from '@slack/web-api';

import { verifyGrowiToSlackRequest, getConnectionStatuses, relationTestToSlack } from '@growi/slack';

import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';

import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';

import { Relation } from '~/entities/relation';
import { Order } from '~/entities/order';


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
    // asserted tokenGtoP is string by verifyGrowiToSlackRequest
    const { tokenGtoP } = req;

    let relation: Relation|undefined;
    try {
      // retrieve relation with Installation
      relation = await this.relationRepository.createQueryBuilder('relation')
        .where('tokenGtoP = :token', { token: tokenGtoP })
        .leftJoinAndSelect('relation.installation', 'installation')
        .getOne();
    }
    catch (error) {
      logger.error(error);
      return res.status(500).send({ message: 'find relation is failure' });
    }

    // Returns the result of the test if it already exists
    if (relation != null) {
      logger.debug('relation found', relation);

      const token = relation.installation.data.bot?.token;
      if (token == null) {
        return res.status(400).send({ message: 'installation is invalid' });
      }
      try {
        await relationTestToSlack(token);
        return res.send({ relation });
      }
      catch (error) {
        logger.error(error);
        return res.status(500).send({ message: 'relation test is failure' });
      }
    }

    let order: Order|undefined;
    try {
    // retrieve latest Order with Installation
      order = await this.orderRepository.createQueryBuilder('order')
        .orderBy('order.createdAt', 'DESC')
        .where('growiAccessToken = :token', { token: tokenGtoP })
        .leftJoinAndSelect('order.installation', 'installation')
        .getOne();
    }
    catch (error) {
      logger.error(error);
      return res.status(500).send({ message: 'find order is failure' });
    }

    if (order == null || order.isExpired()) {
      return res.status(400).send({ message: 'order has expired or does not exist.' });
    }

    logger.debug('order found', order);

    const token = order.installation.data.bot?.token;
    if (token == null) {
      return res.status(400).send({ message: 'installation is invalid' });
    }
    try {
      await relationTestToSlack(token);
    }
    catch (error) {
      logger.error(error);
      return res.status(500).send({ message: 'relation test is failure' });
    }

    logger.debug('relation test is success', order);

    try {
      // TODO GW-5864 issue relation
    }
    catch (error) {
      logger.error(error);
      return res.status(500).send({ message: 'relation test is failure' });
    }

    return res.send({ order });
  }

}
