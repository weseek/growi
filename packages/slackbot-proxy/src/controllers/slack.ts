import {
  BodyParams, Controller, Get, Inject, Post, Req, Res,
} from '@tsed/common';
import { parse } from '@growi/slack/src/utils/slash-command-parser';
import { Installation } from '~/entities/installation';
import { InstallationRepository } from '~/repositories/installation';
import { InstallerService } from '~/services/InstallerService';
import { RegisterService } from '~/services/RegisterService';


@Controller('/slack')
export class SlackCtrl {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  @Inject()
  registerService: RegisterService


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

    const parsedBody = parse(body);

    const growiCommandsMappings = {
      register: () => this.registerService.execSlashCommand(body),
    };
    const executeGrowiCommand = growiCommandsMappings[parsedBody.growiCommandType];

    await executeGrowiCommand();
    res.send();

    return 'This action will be handled by bolt service.';
  }

  @Get('/oauth_redirect')
  async handleOauthRedirect(@Req() req: Req, @Res() res: Res): Promise<void> {
    // illegal state
    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    if (req.query.state === '') {
      throw new Error('illegal state');
    }

    return this.installerService.installer.handleCallback(req, res);

    // TODO: https://youtrack.weseek.co.jp/issue/GW-5543
    // this.installer.handleCallback(req, res, {
    //   success: (installation, metadata, req, res) => {},
    //   failure: (error, installOptions, req, res) => {},
    // });
  }

}
