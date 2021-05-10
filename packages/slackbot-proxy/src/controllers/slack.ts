import {
  BodyParams, Controller, Get, Inject, Post, Req, Res, UseBefore,
} from '@tsed/common';

import axios from 'axios';

import { WebAPICallResult } from '@slack/web-api';

import {
  generateMarkdownSectionBlock, parseSlashCommand, postEphemeralErrors, verifySlackRequest,
} from '@growi/slack';

import { Relation } from '~/entities/relation';
import { AuthedReq } from '~/interfaces/authorized-req';
import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';
import { AddSigningSecretToReq } from '~/middlewares/add-signing-secret-to-req';
import { AuthorizeCommandMiddleware, AuthorizeInteractionMiddleware } from '~/middlewares/authorizer';
import { InstallerService } from '~/services/InstallerService';
import { RegisterService } from '~/services/RegisterService';
import loggerFactory from '~/utils/logger';


const logger = loggerFactory('slackbot-proxy:controllers:slack');


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
  registerService: RegisterService;

  @Get('/install')
  async install(): Promise<string> {
    const url = await this.installerService.installer.generateInstallUrl({
      // Add the scopes your app needs
      scopes: [
        'channels:history',
        'commands',
        'groups:history',
        'im:history',
        'mpim:history',
        'chat:write',
      ],
    });

    return `<a href="${url}">`
      // eslint-disable-next-line max-len
      + '<img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />'
      + '</a>';
  }

  @Post('/commands')
  @UseBefore(AddSigningSecretToReq, verifySlackRequest, AuthorizeCommandMiddleware)
  async handleCommand(@Req() req: AuthedReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
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

    /*
     * forward to GROWI server
     */
    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.find({ installation: installation?.id });

    if (relations.length === 0) {
      return res.json({
        blocks: [
          generateMarkdownSectionBlock('*No relation found.*'),
          generateMarkdownSectionBlock('Run `/growi register` first.'),
        ],
      });
    }

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const promises = relations.map((relation: Relation) => {
      // generate API URL
      const url = new URL('/_api/v3/slack-integration/proxied/commands', relation.growiUri);
      return axios.post(url.toString(), {
        ...body,
        tokenPtoG: relation.tokenPtoG,
        growiCommand,
      });
    });

    // pickup PromiseRejectedResult only
    const results = await Promise.allSettled(promises);
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    const botToken = installation?.data.bot?.token;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return postEphemeralErrors(rejectedResults, body.channel_id, body.user_id, botToken!);
    }
    catch (err) {
      logger.error(err);
    }
  }

  @Post('/interactions')
  @UseBefore(AuthorizeInteractionMiddleware)
  async handleInteraction(@Req() req: AuthedReq, @Res() res: Res): Promise<void|string|Res|WebAPICallResult> {
    logger.info('receive interaction', req.body);
    logger.info('receive interaction', req.authorizeResult);

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

    const payload = JSON.parse(body.payload);
    const { type } = payload;

    // register
    if (type === 'view_submission' && payload.response_urls[0].action_id === 'submit_growi_url_and_access_tokens') {
      await this.registerService.upsertOrderRecord(this.orderRepository, installation, payload);
      await this.registerService.notifyServerUriToSlack(authorizeResult, payload);
      return;
    }

    /*
     * forward to GROWI server
     */
    const relations = await this.relationRepository.find({ installation: installation?.id });

    const promises = relations.map((relation: Relation) => {
      // generate API URL
      const url = new URL('/_api/v3/slack-integration/proxied/interactions', relation.growiUri);
      return axios.post(url.toString(), {
        ...body,
        tokenPtoG: relation.tokenPtoG,
      });
    });

    // pickup PromiseRejectedResult only
    const results = await Promise.allSettled(promises);
    const rejectedResults: PromiseRejectedResult[] = results.filter((result): result is PromiseRejectedResult => result.status === 'rejected');
    const botToken = installation?.data.bot?.token;

    try {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return postEphemeralErrors(rejectedResults, body.channel_id, body.user_id, botToken!);
    }
    catch (err) {
      logger.error(err);
    }
  }

  @Post('/events')
  async handleEvent(@BodyParams() body:{[key:string]:string}, @Res() res: Res): Promise<void|string> {
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
      + '<a href="/slack/install">'
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
