import {
  BodyParams, Controller, Get, Inject, Post, Req, Res, UseBefore,
} from '@tsed/common';

import axios from 'axios';

import { WebAPICallResult } from '@slack/web-api';

import {
  markdownSectionBlock, GrowiCommand, parseSlashCommand, postEphemeralErrors, verifySlackRequest, generateWebClient,
} from '@growi/slack';

// import { Relation } from '~/entities/relation';
import { RelationMock } from '~/entities/relation-mock';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { InstallationRepository } from '~/repositories/installation';
// import { RelationRepository } from '~/repositories/relation';
import { RelationMockRepository } from '~/repositories/relation-mock';
import { OrderRepository } from '~/repositories/order';
import { AddSigningSecretToReq } from '~/middlewares/slack-to-growi/add-signing-secret-to-req';
import { AuthorizeCommandMiddleware, AuthorizeInteractionMiddleware } from '~/middlewares/slack-to-growi/authorizer';
import { ExtractGrowiUriFromReq } from '~/middlewares/slack-to-growi/extract-growi-uri-from-req';
import { InstallerService } from '~/services/InstallerService';
import { SelectGrowiService } from '~/services/SelectGrowiService';
import { RegisterService } from '~/services/RegisterService';
import { RelationsService } from '~/services/RelationsService';
import { UnregisterService } from '~/services/UnregisterService';
import { InvalidUrlError } from '../models/errors';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('slackbot-proxy:controllers:slack');


@Controller('/slack')
export class SlackCtrl {

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
  selectGrowiService: SelectGrowiService;

  @Inject()
  registerService: RegisterService;

  @Inject()
  relationsService: RelationsService;

  @Inject()
  unregisterService: UnregisterService;

  /**
   * Send command to specified GROWIs
   * @param growiCommand
   * @param relations
   * @param body
   * @returns
   */
  private async sendCommand(growiCommand: GrowiCommand, relations: RelationMock[], body: any) {
    if (relations.length === 0) {
      throw new Error('relations must be set');
    }
    const botToken = relations[0].installation?.data.bot?.token; // relations[0] should be exist
    const promises = relations.map((relation: RelationMock) => {
      // generate API URL
      const url = new URL('/_api/v3/slack-integration/proxied/commands', relation.growiUri);
      return axios.post(url.toString(), {
        ...body,
        growiCommand,
      }, {
        headers: {
          'x-growi-ptog-tokens': relation.tokenPtoG,
        },
      });
    });

    // pickup PromiseRejectedResult only
    const results = await Promise.allSettled(promises);
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return postEphemeralErrors(rejectedResults, body.channel_id, body.user_id, botToken!);
    }
    catch (err) {
      logger.error(err);
    }
  }


  @Post('/commands')
  @UseBefore(AddSigningSecretToReq, verifySlackRequest, AuthorizeCommandMiddleware)
  async handleCommand(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    const { body, authorizeResult } = req;

    if (body.text == null) {
      return 'No text.';
    }

    const growiCommand = parseSlashCommand(body);

    // register
    if (growiCommand.growiCommandType === 'register') {
      // Send response immediately to avoid opelation_timeout error
      // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
      res.send();

      return this.registerService.process(growiCommand, authorizeResult, body as {[key:string]:string});
    }

    // unregister
    if (growiCommand.growiCommandType === 'unregister') {
      if (growiCommand.growiCommandArgs.length === 0) {
        return 'GROWI Urls is required.';
      }
      if (!growiCommand.growiCommandArgs.every(v => v.match(/^(https?:\/\/)/))) {
        return 'GROWI Urls must be urls.';
      }

      // Send response immediately to avoid opelation_timeout error
      // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
      res.send();

      return this.unregisterService.process(growiCommand, authorizeResult, body as {[key:string]:string});
    }

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationMockRepository.createQueryBuilder('relation_mock')
      .where('relation_mock.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation_mock.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      return res.json({
        blocks: [
          markdownSectionBlock('*No relation found.*'),
          markdownSectionBlock('Run `/growi register` first.'),
        ],
      });
    }

    // status
    if (growiCommand.growiCommandType === 'status') {
      return res.json({
        blocks: [
          markdownSectionBlock('*Found Relations to GROWI.*'),
          ...relations.map(relation => markdownSectionBlock(`GROWI url: ${relation.growiUri}`)),
        ],
      });
    }

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    // res.send();

    const baseDate = new Date();

    const relationsForSingleUse:RelationMock[] = [];
    await Promise.all(relations.map(async(relation) => {
      const isSupported = await this.relationsService.isSupportedGrowiCommandForSingleUse(relation, growiCommand.growiCommandType, baseDate);
      if (isSupported) {
        relationsForSingleUse.push(relation);
      }
    }));

    let isCommandPermitted = false;

    if (relationsForSingleUse.length > 0) {
      isCommandPermitted = true;
      body.growiUrisForSingleUse = relationsForSingleUse.map(v => v.growiUri);
      return this.selectGrowiService.process(growiCommand, authorizeResult, body);
    }

    const relationsForBroadcastUse:RelationMock[] = [];
    await Promise.all(relations.map(async(relation) => {
      const isSupported = await this.relationsService.isSupportedGrowiCommandForBroadcastUse(relation, growiCommand.growiCommandType, baseDate);
      if (isSupported) {
        relationsForBroadcastUse.push(relation);
      }
    }));

    /*
     * forward to GROWI server
     */
    if (relationsForBroadcastUse.length > 0) {
      isCommandPermitted = true;
      return this.sendCommand(growiCommand, relationsForBroadcastUse, body);
    }

    if (!isCommandPermitted) {
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
        const relationsForSingleUse:RelationMock[] = [];
        body.permittedChannelsForEachCommand = relations[0].permittedChannelsForEachCommand;
        relationsForSingleUse.push(relations[0]);
        return this.sendCommand(growiCommand, relationsForSingleUse, body);
      }

      console.log('hoge');


      // send postEphemral message for not permitted
      const botToken = relations[0].installation?.data.bot?.token;

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const client = generateWebClient(botToken!);
      await client.chat.postEphemeral({
        text: 'Error occured.',
        channel: body.channel_id,
        user: body.user_id,
        blocks: [
          markdownSectionBlock(`It is not allowed to run *'${growiCommand.growiCommandType}'* command to this GROWI.`),
        ],
      });
    }
  }

  @Post('/interactions')
  @UseBefore(AuthorizeInteractionMiddleware, ExtractGrowiUriFromReq)
  async handleInteraction(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    logger.info('receive interaction', req.authorizeResult);
    logger.debug('receive interaction', req.body);

    const { body, authorizeResult } = req;

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    // pass
    if (body.ssl_check != null) {
      return;
    }

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationMockRepository.createQueryBuilder('relation_mock')
      .where('relation_mock.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation_mock.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      return res.json({
        blocks: [
          markdownSectionBlock('*No relation found.*'),
          markdownSectionBlock('Run `/growi register` first.'),
        ],
      });
    }

    const payload = JSON.parse(body.payload);
    console.log(payload);

    const callBackId = payload?.view?.callback_id;

    // register
    if (callBackId === 'register') {
      try {
        await this.registerService.insertOrderRecord(installation, authorizeResult.botToken, payload);
      }
      catch (err) {
        if (err instanceof InvalidUrlError) {
          logger.info(err.message);
          return;
        }
        logger.error(err);
      }

      await this.registerService.notifyServerUriToSlack(authorizeResult.botToken, payload);
      return;
    }

    // unregister
    if (callBackId === 'unregister') {
      await this.unregisterService.unregister(installation, authorizeResult, payload);
      return;
    }

    // TOD0 Imple isSupportedGrowiCommandForSingleCastuse isSupportedGrowiCommandForBroadCastuse

    // check permission at channel level
    const relationMock = await this.relationMockRepository.findOne({ where: { installation } });
    const channelsObject = relationMock?.permittedChannelsForEachCommand.channelsObject;


    let actionId:any;
    let fromChannel:string;
    let extractCommandName:string;

    if (payload?.actions != null) {
      actionId = payload?.actions[0].action_id;
      const splitActionId = payload?.actions[0].action_id.split(':');
      extractCommandName = splitActionId[0];
      fromChannel = payload?.channel.name;
    }
    else {
      actionId = null;
      const splitCallBackId = callBackId.split(':');
      extractCommandName = splitCallBackId[0];

      const privateMeta = JSON.parse(payload?.view.private_metadata);
      fromChannel = privateMeta.channelName;
    }


    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const permittedCommandsForChannel = Object.keys(channelsObject!); // eg. [ 'create', 'search', 'togetter', ... ]
    const targetCommand = permittedCommandsForChannel.find(e => e === extractCommandName);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const permittedChannels = channelsObject![targetCommand!];

    const commandRegExp = new RegExp(`(^${extractCommandName}$)|(^${extractCommandName}:\\w+)`);

    if (commandRegExp.test(actionId) || commandRegExp.test(callBackId)) {
      console.log(fromChannel);

      const isPermittedChannel = permittedChannels.includes(fromChannel);

      if (!isPermittedChannel) {
        const botToken = relations[0].installation?.data.bot?.token;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const client = generateWebClient(botToken!);
        console.log(body);

        await client.chat.postEphemeral({
          text: 'Error occured.',
          channel: body.channel_id,
          user: body.user_id,
          blocks: [
            markdownSectionBlock(`It is not allowed to run *'${extractCommandName}'* command to this GROWI.`),
          ],
        });
        return;
      }
    }


    // forward to GROWI server
    if (callBackId === 'select_growi') {
      const selectedGrowiInformation = await this.selectGrowiService.handleSelectInteraction(installation, payload);
      return this.sendCommand(selectedGrowiInformation.growiCommand, [selectedGrowiInformation.relation], selectedGrowiInformation.sendCommandBody);
    }

    /*
    * forward to GROWI server
    */
    const relation = await this.relationMockRepository.findOne({ installation, growiUri: req.growiUri });

    if (relation == null) {
      logger.error('*No relation found.*');
      return;
    }

    try {
      // generate API URL
      const url = new URL('/_api/v3/slack-integration/proxied/interactions', req.growiUri);
      await axios.post(url.toString(), {
        ...body,
      }, {
        headers: {
          'x-growi-ptog-tokens': relation.tokenPtoG,
        },
      });
    }
    catch (err) {
      logger.error(err);
    }

  }

  @Post('/events')
  async handleEvent(@BodyParams() body:{[key:string]:string} /* , @Res() res: Res */): Promise<void|string> {
    // eslint-disable-next-line max-len
    // see: https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls__request-url-configuration--verification
    if (body.type === 'url_verification') {
      return body.challenge;
    }

    logger.info('receive event', body);

    return;
  }

  @Get('/oauth_redirect')
  async handleOauthRedirect(@Req() req: Req, @Res() res: Res): Promise<void> {

    if (req.query.state === '') {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html>'
      + '<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
      + '<body style="text-align:center; padding-top:20%;">'
      + '<h1>Illegal state, try it again.</h1>'
      + '<a href="/">'
      + 'Go to install page'
      + '</a>'
      + '</body></html>');
    }

    await this.installerService.installer.handleCallback(req, res, {
      success: (installation, metadata, req, res) => {
        logger.info('Success to install', { installation, metadata });

        const appPageUrl = `https://slack.com/apps/${installation.appId}`;

        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html>'
        + '<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        + '<body style="text-align:center; padding-top:20%;">'
        + '<h1>Congratulations!</h1>'
        + '<p>GROWI Bot installation has succeeded.</p>'
        + `<a href="${appPageUrl}">`
        + 'Access to Slack App detail page.'
        + '</a>'
        + '</body></html>');
      },
      failure: (error, installOptions, req, res) => {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<html>'
        + '<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
        + '<body style="text-align:center; padding-top:20%;">'
        + '<h1>GROWI Bot installation failed</h1>'
        + '<p>Please contact administrators of your workspace</p>'
        + 'Reference: <a href="https://slack.com/help/articles/222386767-Manage-app-installation-settings-for-your-workspace">'
        + 'Manage app installation settings for your workspace'
        + '</a>'
        + '</body></html>');
      },
    });
  }

}
