import {
  Installation as SlackInstallation, InstallationQuery, InstallProvider,
} from '@slack/oauth';
import { Inject, Service } from '@tsed/di';

import { Installation } from '~/entities/installation';
import { InstallationRepository } from '~/repositories/installation';

@Service()
export class InstallerService {

  installer: InstallProvider;

  @Inject()
  private readonly repository: InstallationRepository;

  $onInit(): Promise<any> | void {
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    const stateSecret = process.env.SLACK_INSTALLPROVIDER_STATE_SECRET;

    if (clientId === undefined) {
      throw new Error('The environment variable \'SLACK_CLIENT_ID\' must be defined.');
    }
    if (clientSecret === undefined) {
      throw new Error('The environment variable \'SLACK_CLIENT_SECRET\' must be defined.');
    }

    const { repository } = this;

    this.installer = new InstallProvider({
      clientId,
      clientSecret,
      stateSecret,
      installationStore: {
        // upsert
        storeInstallation: async(slackInstallation: SlackInstallation<'v1' | 'v2', boolean>) => {
          const existedInstallation = await repository.findByTeamIdOrEnterpriseId(slackInstallation.team?.id, slackInstallation.enterprise?.id);

          if (existedInstallation != null) {
            existedInstallation.setData(slackInstallation);
            await repository.save(existedInstallation);
            return;
          }

          const installation = new Installation();
          installation.setData(slackInstallation);
          await repository.save(installation);
          return;
        },
        fetchInstallation: async(installQuery: InstallationQuery<boolean>) => {
          const installation: SlackInstallation<'v1' | 'v2', boolean> = {
            team: undefined,
            enterprise: undefined,
            user: {
              id: '',
              token: undefined,
              scopes: undefined,
            },
          };
          return installation;
        },
      },
    });
  }

}
