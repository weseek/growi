import {
  Controller, Get, Inject, PlatformResponse, Post, Req, Res, UseBefore,
} from '@tsed/common';

import axios from 'axios';

import { WebAPICallResult, WebClient } from '@slack/web-api';
import { Installation } from '@slack/oauth';


import {
  markdownSectionBlock, GrowiCommand, parseSlashCommand, postEphemeralErrors, generateWebClient,
  InvalidGrowiCommandError, requiredScopes, postWelcomeMessage, REQUEST_TIMEOUT_FOR_PTOG,
  parseSlackInteractionRequest, verifySlackRequest,
  respond,
} from '@growi/slack';

import { Relation } from '~/entities/relation';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';
import { AddSigningSecretToReq } from '~/middlewares/slack-to-growi/add-signing-secret-to-req';
import {
  AuthorizeCommandMiddleware, AuthorizeInteractionMiddleware, AuthorizeEventsMiddleware,
} from '~/middlewares/slack-to-growi/authorizer';
import { UrlVerificationMiddleware } from '~/middlewares/slack-to-growi/url-verification';
import { ExtractGrowiUriFromReq } from '~/middlewares/slack-to-growi/extract-growi-uri-from-req';
import { JoinToConversationMiddleware } from '~/middlewares/slack-to-growi/join-to-conversation';
import { InstallerService } from '~/services/InstallerService';
import { SelectGrowiService } from '~/services/SelectGrowiService';
import { RegisterService } from '~/services/RegisterService';
import { RelationsService } from '~/services/RelationsService';
import { UnregisterService } from '~/services/UnregisterService';
import { InvalidUrlError } from '../models/errors';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('slackbot-proxy:controllers:slack');

const postNotAllowedMessage = async(client:WebClient, channelId:string, userId:string, disallowedGrowiUrls:Set<string>, commandName:string):Promise<void> => {

  const linkUrlList = Array.from(disallowedGrowiUrls).map((growiUrl) => {
    return '\n'
      + `• ${new URL('/admin/slack-integration', growiUrl).toString()}`;
  });

  const growiDocsLink = 'https://docs.growi.org/en/admin-guide/upgrading/43x.html';


  await client.chat.postEphemeral({
    text: 'Error occured.',
    channel: channelId,
    user: userId,
    blocks: [
      markdownSectionBlock('*None of GROWI permitted the command.*'),
      markdownSectionBlock(`*'${commandName}'* command was not allowed.`),
      markdownSectionBlock(
        `To use this command, modify settings from following pages: ${linkUrlList}`,
      ),
      markdownSectionBlock(
        `Or, if your GROWI version is 4.3.0 or below, upgrade GROWI to use commands and permission settings: ${growiDocsLink}`,
      ),
    ],
  });

  return;
};
@Controller('/slack')
export class SlackCtrl {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  @Inject()
  relationRepository: RelationRepository;

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
  private async sendCommand(growiCommand: GrowiCommand, relations: Relation[], body: any) {
    if (relations.length === 0) {
      throw new Error('relations must be set');
    }

    const botToken = relations[0].installation?.data.bot?.token; // relations[0] should be exist
    const promises = relations.map((relation: Relation) => {
      // generate API URL
      const url = new URL('/_api/v3/slack-integration/proxied/commands', relation.growiUri);
      return axios.post(url.toString(), {
        ...body,
        growiCommand,
      }, {
        headers: {
          'x-growi-ptog-tokens': relation.tokenPtoG,
        },
        timeout: REQUEST_TIMEOUT_FOR_PTOG,
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
  @UseBefore(AddSigningSecretToReq, verifySlackRequest, AuthorizeCommandMiddleware, JoinToConversationMiddleware)
  async handleCommand(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    const { body, authorizeResult } = req;

    // retrieve bot token
    const { botToken } = authorizeResult;
    if (botToken == null) {
      const serverUri = process.env.SERVER_URI;
      res.json({
        blocks: [
          markdownSectionBlock('*Installation might be failed.*'),
          markdownSectionBlock(`Access to ${serverUri} and re-install GROWI App`),
        ],
      });
    }

    // parse /growi command
    let growiCommand: GrowiCommand;
    try {
      growiCommand = parseSlashCommand(body);
    }
    catch (err) {
      if (err instanceof InvalidGrowiCommandError) {
        res.json({
          blocks: [
            markdownSectionBlock('*Command type is not specified.*'),
            markdownSectionBlock('Run `/growi help` to check the commands you can use.'),
          ],
        });
      }
      logger.error(err.message);
      return;
    }

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.json();

    // register
    if (growiCommand.growiCommandType === 'register') {
      return this.registerService.process(growiCommand, authorizeResult, body as {[key:string]:string});
    }

    // unregister
    if (growiCommand.growiCommandType === 'unregister') {
      return this.unregisterService.process(growiCommand, authorizeResult, body as {[key:string]:string});
    }

    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      return respond(growiCommand.responseUrl, {
        blocks: [
          markdownSectionBlock('*No relation found.*'),
          markdownSectionBlock('Run `/growi register` first.'),
        ],
      });
    }

    // status
    if (growiCommand.growiCommandType === 'status') {
      return respond(growiCommand.responseUrl, {
        blocks: [
          markdownSectionBlock('*Found Relations to GROWI.*'),
          ...relations.map(relation => markdownSectionBlock(`GROWI url: ${relation.growiUri}`)),
        ],
      });
    }

    await respond(growiCommand.responseUrl, {
      blocks: [
        markdownSectionBlock(`Processing your request *"/growi ${growiCommand.text}"* ...`),
      ],
    });

    const baseDate = new Date();

    const allowedRelationsForSingleUse:Relation[] = [];
    const allowedRelationsForBroadcastUse:Relation[] = [];
    const disallowedGrowiUrls: Set<string> = new Set();

    // check permission
    await Promise.all(relations.map(async(relation) => {
      const isSupportedForSingleUse = await this.relationsService.isPermissionsForSingleUseCommands(
        relation, growiCommand.growiCommandType, body.channel_name, baseDate,
      );

      let isSupportedForBroadcastUse = false;
      if (!isSupportedForSingleUse) {
        isSupportedForBroadcastUse = await this.relationsService.isPermissionsUseBroadcastCommands(
          relation, growiCommand.growiCommandType, body.channel_name, baseDate,
        );
      }

      if (isSupportedForSingleUse) {
        allowedRelationsForSingleUse.push(relation);
      }
      else if (isSupportedForBroadcastUse) {
        allowedRelationsForBroadcastUse.push(relation);
      }
      else {
        disallowedGrowiUrls.add(relation.growiUri);
      }
    }));

    // when all of GROWI disallowed
    if (relations.length === disallowedGrowiUrls.size) {
      const linkUrlList = Array.from(disallowedGrowiUrls).map((growiUrl) => {
        return '\n'
          + `• ${new URL('/admin/slack-integration', growiUrl).toString()}`;
      });

      const growiDocsLink = 'https://docs.growi.org/en/admin-guide/upgrading/43x.html';

      return respond(growiCommand.responseUrl, {
        text: 'Error occured.',
        blocks: [
          markdownSectionBlock('*None of GROWI permitted the command.*'),
          markdownSectionBlock(`*'${growiCommand.growiCommandType}'* command was not allowed.`),
          markdownSectionBlock(
            `To use this command, modify settings from following pages: ${linkUrlList}`,
          ),
          markdownSectionBlock(
            `Or, if your GROWI version is 4.3.0 or below, upgrade GROWI to use commands and permission settings: ${growiDocsLink}`,
          ),
        ],
      });
    }

    // select GROWI
    if (allowedRelationsForSingleUse.length > 0) {
      body.growiUrisForSingleUse = allowedRelationsForSingleUse.map(v => v.growiUri);
      return this.selectGrowiService.process(growiCommand, authorizeResult, body);
    }

    // forward to GROWI server
    if (allowedRelationsForBroadcastUse.length > 0) {
      return this.sendCommand(growiCommand, allowedRelationsForBroadcastUse, body);
    }
  }


  @Post('/interactions')
  @UseBefore(/* AddSigningSecretToReq, verifySlackRequest, */ parseSlackInteractionRequest, AuthorizeInteractionMiddleware, ExtractGrowiUriFromReq)
  async handleInteraction(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    logger.info('receive interaction', req.authorizeResult);
    logger.debug('receive interaction', req.body);

    const { body, authorizeResult, interactionPayload } = req;

    // pass
    if (body.ssl_check != null) {
      return;
    }
    if (interactionPayload == null) {
      return;
    }

    const callbackId: string = interactionPayload?.view?.callback_id;

    // TAICHI TODO: fix this GW-7496
    // const actionId = req.interactionPayloadAccessor.firstAction?.action_id;
    const actionId = interactionPayload.actions[0]?.action_id;

    // TAICHI TODO: clean here;
    // register
    if (callbackId === 'register') {
      try {
        await this.registerService.insertOrderRecord(authorizeResult, interactionPayload);
      }
      catch (err) {
        if (err instanceof InvalidUrlError) {
          logger.info(err.message);
          return;
        }
        logger.error(err);
      }

      await this.registerService.notifyServerUriToSlack(interactionPayload);
      return;
    }

    // unregister
    if (actionId === 'unregister') {
      await this.unregisterService.unregister(authorizeResult, interactionPayload);
      return;
    }

    // unregister cancel action
    if (actionId === 'unregister:cancel') {
      await this.unregisterService.cancel(interactionPayload);
      return;
    }

    let privateMeta:any;

    if (interactionPayload.view != null) {
      privateMeta = JSON.parse(interactionPayload?.view?.private_metadata);
    }

    const channelName = interactionPayload.channel?.name || privateMeta?.body?.channel_name || privateMeta?.channelName;

    // forward to GROWI server
    if (actionId === 'select_growi') {
      // Send response immediately to avoid opelation_timeout error
      // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
      res.send();

      const selectedGrowiInformation = await this.selectGrowiService.handleSelectInteraction(authorizeResult, interactionPayload);
      return this.sendCommand(selectedGrowiInformation.growiCommand, [selectedGrowiInformation.relation], selectedGrowiInformation.sendCommandBody);
    }

    // TAICHI TODO: consider cleaning code below;
    // check permission
    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.createQueryBuilder('relation')
      .where('relation.installationId = :id', { id: installation?.id })
      .leftJoinAndSelect('relation.installation', 'installation')
      .getMany();

    if (relations.length === 0) {
      return res.json({
        blocks: [
          markdownSectionBlock('*No relation found.*'),
          markdownSectionBlock('Run `/growi register` first.'),
        ],
      });
    }

    const permission = await this.relationsService.checkPermissionForInteractions(relations, actionId, callbackId, channelName);
    const {
      allowedRelations, disallowedGrowiUrls, commandName, rejectedResults,
    } = permission;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      await postEphemeralErrors(rejectedResults, interactionPayload.channel.id, interactionPayload.user.id, authorizeResult.botToken!);
    }
    catch (err) {
      logger.error(err);
    }

    if (relations.length === disallowedGrowiUrls.size) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const client = generateWebClient(authorizeResult.botToken!);
      return postNotAllowedMessage(client, interactionPayload.channel.id, interactionPayload.user.id, disallowedGrowiUrls, commandName);
    }

    /*
     * forward to GROWI server
     */
    allowedRelations.map(async(relation) => {
      try {
        // generate API URL
        const url = new URL('/_api/v3/slack-integration/proxied/interactions', relation.growiUri);
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

    });
  }

  @Post('/events')
  @UseBefore(UrlVerificationMiddleware, AuthorizeEventsMiddleware)
  async handleEvent(@Req() req: SlackOauthReq): Promise<void> {

    const { authorizeResult } = req;
    const client = generateWebClient(authorizeResult.botToken);

    if (req.body.event.type === 'app_home_opened') {
      await postWelcomeMessage(client, req.body.event.channel);
    }

    return;
  }

  @Get('/oauth_redirect')
  async handleOauthRedirect(@Req() req: Req, @Res() serverRes: Res, @Res() platformRes: PlatformResponse): Promise<void|string> {

    // create 'Add to Slack' url
    const addToSlackUrl = await this.installerService.installer.generateInstallUrl({
      scopes: requiredScopes,
    });

    const state = req.query.state;
    if (state == null || state === '') {
      return platformRes.status(400).render('install-failed.ejs', { url: addToSlackUrl });
    }

    // promisify
    const installPromise = new Promise<Installation>((resolve, reject) => {
      this.installerService.installer.handleCallback(req, serverRes, {
        success: async(installation, metadata) => {
          logger.info('Success to install', { installation, metadata });
          resolve(installation);
        },
        failure: async(error) => {
          reject(error); // go to catch block
        },
      });
    });

    let httpStatus = 200;
    let httpBody;
    try {
      const installation = await installPromise;

      // check whether bot is not null
      if (installation.bot == null) {
        logger.warn('Success to install but something wrong. `installation.bot` is null.');
        httpStatus = 500;
        httpBody = await platformRes.render('install-succeeded-but-has-problem.ejs', { reason: '`installation.bot` is null' });
      }
      // MAIN PATH: everything is fine
      else {
        const appPageUrl = `https://slack.com/apps/${installation.appId}`;
        httpBody = await platformRes.render('install-succeeded.ejs', { appPageUrl });

        // generate client
        const client = generateWebClient(installation.bot.token);

        const userId = installation.user.id;

        await Promise.all([
          // post message
          postWelcomeMessage(client, userId),
          // publish home
          // TODO When Home tab show off, use bellow.
          // publishInitialHomeView(client, userId),
        ]);
      }
    }
    catch (error) {
      logger.error(error);
      httpStatus = 500;
      httpBody = await platformRes.status(400).render('install-failed.ejs', { url: addToSlackUrl });
    }

    platformRes.status(httpStatus);
    return httpBody;
  }

}
