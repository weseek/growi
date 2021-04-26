import {
  BodyParams, Controller, Get, Inject, Post, Req, Res, UseBefore,
} from '@tsed/common';

import axios from 'axios';

import { parseSlashCommand } from '@growi/slack';
import { Installation } from '~/entities/installation';

import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';
import { InstallerService } from '~/services/InstallerService';
import { RegisterService } from '~/services/RegisterService';

import loggerFactory from '~/utils/logger';
import { AuthorizeCommandMiddleware, AuthorizeInteractionMiddleware } from '~/middlewares/authorizer';
import { AuthedReq } from '~/interfaces/authorized-req';
import { Relation } from '~/entities/relation';

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

  @Get('/testsave')
  testsave(): void {
    const installation = new Installation();
    installation.data = {
      team: undefined,
      enterprise: undefined,
      user: {
        id: '',
        token: undefined,
        scopes: undefined,
      },
    };

    // const installationRepository = getRepository(Installation);

    this.installationRepository.save(installation);
  }


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
  @UseBefore(AuthorizeCommandMiddleware)
  async handleCommand(@Req() req: AuthedReq, @Res() res: Res): Promise<void|string> {
    const { body, authorizeResult } = req;

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const growiCommand = parseSlashCommand(body);

    // register
    if (growiCommand.growiCommandType === 'register') {
      await this.registerService.process(growiCommand, authorizeResult, body as {[key:string]:string});
      return;
    }

    /*
     * forward to GROWI server
     */
    const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
    const relations = await this.relationRepository.find({ installation: installation?.id });

    await relations.map((relation: Relation) => {
      // generate API URL
      const url = new URL('/_api/v3/slack-bot/commands', relation.growiUri);
      return axios.post(url.toString(), {
        ...body,
        tokenPtoG: relation.tokenPtoG,
        growiCommand,
      });
    });

    // return;
  }

  @Post('/interactions')
  // TODO: using new middleware (5789 blocking)
  // ~~@UseBefore(AuthorizeMiddleware)~~
  @UseBefore(AuthorizeInteractionMiddleware)
  async handleInteraction(@Req() req: AuthedReq, @Res() res: Res): Promise<void|string> {
    logger.info('receive interaction', req.body);
    logger.info('receive interaction', req.authorizeResult);
    return;
  }

  // const { body, authorizeResult } = req;
  // console.log('authorizeResult', authorizeResult);
  //   logger.info('receive interaction', body);

  //   const installation = await this.installationRepository.findByID('1');
  //   if (installation == null) {
  //     throw new Error('installation is reqiured');
  //   }

  //   const handleViewSubmission = async(inputValues) => {

  //     const newGrowiUrl = inputValues.growiDomain.contents_input.value;
  //     const newGrowiAccessToken = inputValues.growiAccessToken.contents_input.value;
  //     const newProxyAccessToken = inputValues.proxyToken.contents_input.value;
  //     console.log('newGrowiUrl', newGrowiUrl);
  //     console.log('newGrowiAccessToken', newGrowiAccessToken);
  //     console.log('newAccessToken', newProxyAccessToken);

  //     const order = await this.orderRepository;

  //     const growiUrl = order.metadata.propertiesMap.growiUrl;
  //     const growiAccessToken = order.metadata.propertiesMap.growiAccessToken;
  //     const proxyAccessToken = order.metadata.propertiesMap.proxyAccessToken;

  //     console.log('order.metadata.propertiesMap', order.metadata.propertiesMap);

  //     order.update({ growiUrl }, { growiUrl: newGrowiUrl });
  //     order.update({ growiAccessToken }, { growiAccessToken: newGrowiAccessToken });
  //     order.update({ proxyAccessToken }, { proxyAccessToken: newProxyAccessToken });
  //     res.send();

  //   };

  //   if (body.payload != null) {
  //     const payload = JSON.parse(body.payload);
  //     const { type } = payload;
  //     const inputValues = payload.view.state.values;

  //     try {
  //       switch (type) {
  //         case 'view_submission':
  //           await handleViewSubmission(inputValues);
  //           break;
  //         default:
  //           break;
  //       }
  //     }
  //     catch (error) {
  //       throw new Error(error.message);
  //     }

  //   }
  //   if (body.text == null) {
  //     return 'No text.';
  //   }

  //   // Find the latest order by installationId and GROWIurl
  //   let order = await this.orderRepository.findOne({
  //     installation: installation.id,
  //   }, {
  //     order: {
  //       createdAt: 'DESC',
  //     },
  /*
     * forward to GROWI server
     */
  // const installationId = authorizeResult.enterpriseId || authorizeResult.teamId;
  // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const installation = await this.installationRepository.findByTeamIdOrEnterpriseId(installationId!);
  // const relations = await this.relationRepository.find({ installation: installation?.id });

  // await relations.map((relation: Relation) => {
  //   // generate API URL
  //   const url = new URL('/_api/v3/slack-bot/commands', relation.growiUri);
  //   return axios.post(url.toString(), {
  //     ...body,
  //     tokenPtoG: relation.tokenPtoG,
  //     growiCommand,
  //   });
  // });
  // }

  // @Post('/interactions')
  // @UseBefore(AuthorizeInteractionMiddleware)
  // async handleInteraction(@Req() req: AuthedReq, @Res() res: Res): Promise<void|string> {
  //   logger.info('receive interaction', req.body);
  //   logger.info('receive interaction', req.authorizeResult);
  //   return;
  // }

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
