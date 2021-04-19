import {
  BodyParams, Controller, Get, Inject, Post, Req, Res,
} from '@tsed/common';
import { parseSlashCommand } from '@growi/slack';
import { Installation } from '~/entities/installation';

import { InstallationRepository } from '~/repositories/installation';
import { RelationRepository } from '~/repositories/relation';
import { OrderRepository } from '~/repositories/order';
import { InstallerService } from '~/services/InstallerService';
import { RegisterService } from '~/services/RegisterService';


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

  growiCommandsMappings = {
    register: async(body:{[key:string]:string}):Promise<void> => this.registerService.execSlashCommand(body),
  };

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

  @Post('/events')
  async handleEvent(@BodyParams() body:{[key:string]:string}, @Res() res: Res): Promise<string> {
    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events

    if (body.text == null) {
      return 'No text.';
    }

    const parsedBody = parseSlashCommand(body);
    const executeGrowiCommand = this.growiCommandsMappings[parsedBody.growiCommandType];

    if (executeGrowiCommand == null) {
      return 'No executeGrowiCommand';
    }
    await executeGrowiCommand(body);
    res.send();

    const installation = await this.installationRepository.findByID('1');
    if (installation == null) {
      throw new Error('installation is reqiured');
    }

    // Find the latest order by installationId
    let order = await this.orderRepository.findOne({
      installation: installation.id,
    }, {
      order: {
        createdAt: 'DESC',
      },
    });

    if (order == null || order.isExpired()) {
      order = await this.orderRepository.save({ installation: installation.id });
    }

    return 'This action will be handled by bolt service.';
  }

  @Get('/oauth_redirect')
  async handleOauthRedirect(@Req() req: Req, @Res() res: Res): Promise<void> {

    // illegal state
    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    if (req.query.state !== 'init') {
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<html>'
      + '<head><meta name="viewport" content="width=device-width,initial-scale=1"></head>'
      + '<body style="text-align:center; padding-top:20%;">'
      + '<h1>Illegal state, try it again.</h1>'
      + '<a href="/slack/install">'
      + 'go to install page'
      + '</a>'
      + '</body></html>');
    }

    this.installerService.installer.handleCallback(req, res, {
      // success: (installation, metadata, req, res) => {},
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
