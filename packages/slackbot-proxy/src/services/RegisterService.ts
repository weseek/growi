import { Inject, Service } from '@tsed/di';
import { WebClient, LogLevel } from '@slack/web-api';
import { generateInputSectionBlock } from '@growi/slack';
import { InstallationQuery } from '@slack/oauth';
import { GrowiCommandsMappings } from '../interfaces/growi-commands-mappings';
import { InstallerService } from './InstallerService';

@Service()
export class RegisterService implements GrowiCommandsMappings {

  @Inject()
  private readonly installerService: InstallerService;

  async execSlashCommand(body:{[key:string]:string}):Promise<void> {

    // create query from body
    const query: InstallationQuery<boolean> = {
      teamId: body.team_id,
      enterpriseId: body.enterprize_id,
      isEnterpriseInstall: body.is_enterprise_install === 'true',
    };

    const result = await this.installerService.installer.authorize(query);
    const { botToken } = result;

    // tmp use process.env
    const client = new WebClient(botToken, { logLevel: LogLevel.DEBUG });
    await client.views.open({
      trigger_id: body.trigger_id,
      view: {
        type: 'modal',
        title: {
          type: 'plain_text',
          text: 'Register Credentials',
        },
        submit: {
          type: 'plain_text',
          text: 'Submit',
        },
        close: {
          type: 'plain_text',
          text: 'Close',
        },
        blocks: [
          generateInputSectionBlock('growiDomain', 'GROWI domain', 'contents_input', false, 'https://example.com'),
          generateInputSectionBlock('growiAccessToken', 'GROWI ACCESS_TOKEN', 'contents_input', false, 'jBMZvpk.....'),
          generateInputSectionBlock('proxyToken', 'PROXY ACCESS_TOKEM', 'contents_input', false, 'jBMZvpk.....'),
        ],
      },
    });
  }

}
