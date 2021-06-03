import {
  Controller, Get, Post, Inject, Req, Res, UseBefore, PathParams,
} from '@tsed/common';
import axios from 'axios';

import { WebAPICallOptions, WebAPICallResult } from '@slack/web-api';

import {
  verifyGrowiToSlackRequest, getConnectionStatuses, getConnectionStatus, generateWebClient,
} from '@growi/slack';

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

  async requestToGrowi(growiUrl:string, tokenPtoG:string):Promise<void> {
    const url = new URL('/_api/v3/slack-integration/proxied/commands', growiUrl);
    await axios.post(url.toString(), {
      type: 'url_verification',
      challenge: 'this_is_my_challenge_token',
    },
    {
      headers: {
        'x-growi-ptog-tokens': tokenPtoG,
      },
    });
  }

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

    // key: tokenGtoP, value: botToken
    const botTokenResolverMapping: {[tokenGtoP:string]:string} = {};

    relations.forEach((relation) => {
      const botToken = relation.installation?.data?.bot?.token;
      if (botToken != null) {
        botTokenResolverMapping[relation.tokenGtoP] = botToken;
      }
    });

    const connectionStatuses = await getConnectionStatuses(Object.keys(botTokenResolverMapping), (tokenGtoP:string) => botTokenResolverMapping[tokenGtoP]);
    return res.send({ connectionStatuses });
  }

  @Get('/relation-test')
  @UseBefore(verifyGrowiToSlackRequest)
  async postRelation(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    const { tokenGtoPs } = req;

    if (tokenGtoPs.length !== 1) {
      return res.status(400).send({ message: 'installation is invalid' });
    }

    const tokenGtoP = tokenGtoPs[0];

    // retrieve relation with Installation
    const relation = await this.relationRepository.createQueryBuilder('relation')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    // Returns the result of the test if it already exists
    if (relation != null) {
      logger.debug('relation found', relation);

      const token = relation.installation.data.bot?.token;
      if (token == null) {
        return res.status(400).send({ message: 'installation is invalid' });
      }

      try {
        await this.requestToGrowi(relation.growiUri, relation.tokenPtoG);
      }
      catch (err) {
        logger.error(err);
        return res.status(400).send({ message: `failed to request to GROWI. err: ${err.message}` });
      }

      const status = await getConnectionStatus(token);
      if (status.error != null) {
        return res.status(400).send({ message: `failed to get connection. err: ${status.error}` });
      }

      return res.send({ relation, slackBotToken: token });
    }

    // retrieve latest Order with Installation
    const order = await this.orderRepository.createQueryBuilder('order')
      .orderBy('order.createdAt', 'DESC')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('order.installation', 'installation')
      .getOne();

    if (order == null || order.isExpired()) {
      return res.status(400).send({ message: 'order has expired or does not exist.' });
    }

    // Access the GROWI URL saved in the Order record and check if the GtoP token is valid.
    try {
      await this.requestToGrowi(order.growiUrl, order.tokenPtoG);
    }
    catch (err) {
      logger.error(err);
      return res.status(400).send({ message: `failed to request to GROWI. err: ${err.message}` });
    }

    logger.debug('order found', order);

    const token = order.installation.data.bot?.token;
    if (token == null) {
      return res.status(400).send({ message: 'installation is invalid' });
    }

    const status = await getConnectionStatus(token);
    if (status.error != null) {
      return res.status(400).send({ message: `failed to get connection. err: ${status.error}` });
    }

    logger.debug('relation test is success', order);

    // Transaction is not considered because it is used infrequently,
    const createdRelation = await this.relationRepository.save({
      installation: order.installation, tokenGtoP: order.tokenGtoP, tokenPtoG: order.tokenPtoG, growiUri: order.growiUrl,
    });

    return res.send({ relation: createdRelation, slackBotToken: token });
  }

  @Post('/:method')
  @UseBefore(verifyGrowiToSlackRequest)
  async postResult(@PathParams('method') method: string, @Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    const { tokenGtoPs } = req;

    if (tokenGtoPs.length !== 1) {
      return res.status(400).send({ message: 'tokenGtoPs is invalid' });
    }

    const tokenGtoP = tokenGtoPs[0];

    // retrieve relation with Installation
    const relation = await this.relationRepository.createQueryBuilder('relation')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    if (relation == null) {
      return res.status(400).send({ message: 'relation is invalid' });
    }

    const token = relation.installation.data.bot?.token;
    if (token == null) {
      return res.status(400).send({ message: 'installation is invalid' });
    }

    const client = generateWebClient(token);

    try {
      const opt = req.body as WebAPICallOptions;
      opt.headers = req.headers;
      await client.apiCall(method, opt);
    }
    catch (err) {
      logger.error(err);
      return res.status(400).send({ message: `failed to send to slack. err: ${err.message}` });
    }

    logger.debug('send to slack is success');

    // required to return ok for apiCall
    return res.send({ ok: true });
  }

}
