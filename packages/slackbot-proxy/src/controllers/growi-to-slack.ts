import {
  Controller, Get, Post, Inject, Req, Res, UseBefore, PathParams, Put,
} from '@tsed/common';
import axios from 'axios';
import createError from 'http-errors';
import { addHours } from 'date-fns';

import { ErrorCode, WebAPICallResult } from '@slack/web-api';

import {
  verifyGrowiToSlackRequest, getConnectionStatuses, getConnectionStatus, REQUEST_TIMEOUT_FOR_PTOG, generateWebClient,
} from '@growi/slack';

import { WebclientRes, AddWebclientResponseToRes } from '~/middlewares/growi-to-slack/add-webclient-response-to-res';

import { GrowiReq } from '~/interfaces/growi-to-slack/growi-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { RelationMockRepository } from '~/repositories/relation-mock';
import { OrderRepository } from '~/repositories/order';

import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';
import { ViewInteractionPayloadDelegator } from '~/services/growi-uri-injector/ViewInteractionPayloadDelegator';
import { ActionsBlockPayloadDelegator } from '~/services/growi-uri-injector/ActionsBlockPayloadDelegator';
import { SectionBlockPayloadDelegator } from '~/services/growi-uri-injector/SectionBlockPayloadDelegator';


const logger = loggerFactory('slackbot-proxy:controllers:growi-to-slack');

@Controller('/g2s')
export class GrowiToSlackCtrl {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  // @Inject()
  // relationRepository: RelationRepository;

  @Inject()
  relationMockRepository: RelationMockRepository;

  @Inject()
  orderRepository: OrderRepository;

  @Inject()
  viewInteractionPayloadDelegator: ViewInteractionPayloadDelegator;

  @Inject()
  actionsBlockPayloadDelegator: ActionsBlockPayloadDelegator;

  @Inject()
  sectionBlockPayloadDelegator: SectionBlockPayloadDelegator;

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
      timeout: REQUEST_TIMEOUT_FOR_PTOG,
    });
  }

  @Get('/connection-status')
  @UseBefore(verifyGrowiToSlackRequest)
  async getConnectionStatuses(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    // asserted (tokenGtoPs.length > 0) by verifyGrowiToSlackRequest
    const { tokenGtoPs } = req;

    // retrieve Relation with Installation
    const relations = await this.relationMockRepository.createQueryBuilder('relation')
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

  @Put('/supported-commands')
  @UseBefore(verifyGrowiToSlackRequest)
  async putSupportedCommands(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    // asserted (tokenGtoPs.length > 0) by verifyGrowiToSlackRequest
    const { tokenGtoPs } = req;

    // MOCK DATA SO FAR BUT THIS CAN BE USED AS AN ACTUAL CODE AS WELL GW 6972 -----------
    const { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands } = req.body;
    // MOCK DATA SO FAR BUT THIS CAN BE USED AS AN ACTUAL CODE AS WELL GW 6972 -----------

    if (tokenGtoPs.length !== 1) {
      throw createError(400, 'installation is invalid');
    }

    const tokenGtoP = tokenGtoPs[0];

    // MOCK DATA MODIFY THIS GW 6972 -----------
    const relation = await this.relationMockRepository.update(
      { tokenGtoP }, { permissionsForBroadcastUseCommands, permissionsForSingleUseCommands },
    );
    // MOCK DATA MODIFY THIS GW 6972 -----------

    return res.send({ relation });
  }

  @Post('/relation-test')
  @UseBefore(verifyGrowiToSlackRequest)
  async postRelation(@Req() req: GrowiReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    const { tokenGtoPs } = req;

    if (tokenGtoPs.length !== 1) {
      throw createError(400, 'installation is invalid');
    }

    const tokenGtoP = tokenGtoPs[0];

    // retrieve relation with Installation
    const relation = await this.relationMockRepository.createQueryBuilder('relation')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    // Returns the result of the test if it already exists
    if (relation != null) {
      logger.debug('relation found', relation);

      const token = relation.installation.data.bot?.token;
      if (token == null) {
        throw createError(400, 'installation is invalid');
      }

      try {
        await this.requestToGrowi(relation.growiUri, relation.tokenPtoG);
      }
      catch (err) {
        logger.error(err);
        throw createError(400, `failed to request to GROWI. err: ${err.message}`);
      }

      const status = await getConnectionStatus(token);
      if (status.error != null) {
        throw createError(400, `failed to get connection. err: ${status.error}`);
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
      throw createError(400, 'order has expired or does not exist.');
    }

    // Access the GROWI URL saved in the Order record and check if the GtoP token is valid.
    try {
      await this.requestToGrowi(order.growiUrl, order.tokenPtoG);
    }
    catch (err) {
      logger.error(err);
      throw createError(400, `failed to request to GROWI. err: ${err.message}`);
    }

    logger.debug('order found', order);

    const token = order.installation.data.bot?.token;
    if (token == null) {
      throw createError(400, 'installation is invalid');
    }

    const status = await getConnectionStatus(token);
    if (status.error != null) {
      throw createError(400, `failed to get connection. err: ${status.error}`);
    }

    logger.debug('relation test is success', order);

    // temporary cache for 48 hours
    const expiredAtCommands = addHours(new Date(), 48);

    // MOCK DATA DELETE THIS GW-6972 7004 ---------------
    /**
     * this code represents the creation of cache (Relation schema) using request from GROWI
     */
    // Transaction is not considered because it is used infrequently
    const response = await this.relationMockRepository.createQueryBuilder('relation')
      .insert()
      .values({
        installation: order.installation,
        tokenGtoP: order.tokenGtoP,
        tokenPtoG: order.tokenPtoG,
        growiUri: order.growiUrl,
        permissionsForBroadcastUseCommands: req.body.permissionsForBroadcastUseCommands,
        permissionsForSingleUseCommands: req.body.permissionsForSingleUseCommands,
        expiredAtCommands,
      })
      // https://github.com/typeorm/typeorm/issues/1090#issuecomment-634391487
      .orUpdate({
        conflict_target: ['installation', 'growiUri'],
        overwrite: ['tokenGtoP', 'tokenPtoG', 'permissionsForBroadcastUseCommands', 'permissionsForSingleUseCommands'],
      })
      .execute();
    // MOCK DATA DELETE THIS GW-6972 7004 ---------------

    // Find the generated relation
    // const generatedRelation = await this.relationMockRepository.findOne({ id: response.identifiers[0].id });
    const generatedRelationMock = await this.relationMockRepository.findOne({ id: response.identifiers[0].id });

    return res.send({ relation: generatedRelationMock, slackBotToken: token });
  }

  injectGrowiUri(req: GrowiReq, growiUri: string): void {
    if (req.body.view == null && req.body.blocks == null) {
      return;
    }

    if (req.body.view != null) {
      const parsedElement = JSON.parse(req.body.view);
      // delegate to ViewInteractionPayloadDelegator
      if (this.viewInteractionPayloadDelegator.shouldHandleToInject(parsedElement)) {
        this.viewInteractionPayloadDelegator.inject(parsedElement, growiUri);
        req.body.view = JSON.stringify(parsedElement);
      }
    }
    else if (req.body.blocks != null) {
      const parsedElement = JSON.parse(req.body.blocks);
      // delegate to ActionsBlockPayloadDelegator
      if (this.actionsBlockPayloadDelegator.shouldHandleToInject(parsedElement)) {
        this.actionsBlockPayloadDelegator.inject(parsedElement, growiUri);
        req.body.blocks = JSON.stringify(parsedElement);
      }
      // delegate to SectionBlockPayloadDelegator
      if (this.sectionBlockPayloadDelegator.shouldHandleToInject(parsedElement)) {
        this.sectionBlockPayloadDelegator.inject(parsedElement, growiUri);
        req.body.blocks = JSON.stringify(parsedElement);
      }
    }
  }

  @Post('/:method')
  @UseBefore(AddWebclientResponseToRes, verifyGrowiToSlackRequest)
  async callSlackApi(
    @PathParams('method') method: string, @Req() req: GrowiReq, @Res() res: WebclientRes,
  ): Promise<WebclientRes> {
    const { tokenGtoPs } = req;

    logger.debug('Slack API called: ', { method });

    if (tokenGtoPs.length !== 1) {
      return res.simulateWebAPIPlatformError('tokenGtoPs is invalid', 'invalid_tokenGtoP');
    }

    const tokenGtoP = tokenGtoPs[0];

    // retrieve relation with Installation
    const relation = await this.relationMockRepository.createQueryBuilder('relation')
      .where('tokenGtoP = :token', { token: tokenGtoP })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getOne();

    if (relation == null) {
      return res.simulateWebAPIPlatformError('relation is invalid', 'invalid_relation');
    }

    const token = relation.installation.data.bot?.token;
    if (token == null) {
      return res.simulateWebAPIPlatformError('installation is invalid', 'invalid_installation');
    }

    // generate WebClient with no retry because GROWI main side will do
    const client = generateWebClient(token, {
      retryConfig: { retries: 0 },
    });

    try {
      this.injectGrowiUri(req, relation.growiUri);

      const opt = req.body;
      opt.headers = req.headers;

      logger.debug({ method, opt });
      // !! DO NOT REMOVE `await ` or it does not enter catch block even when axios error occured !! -- 2021.08.22 Yuki Takei
      const result = await client.apiCall(method, opt);

      return res.send(result);
    }
    catch (err) {
      logger.error(err);

      if (err.code === ErrorCode.PlatformError) {
        return res.simulateWebAPIPlatformError(err.message, err.code);
      }

      return res.simulateWebAPIRequestError(err.message, err.response?.status);
    }
  }

}
