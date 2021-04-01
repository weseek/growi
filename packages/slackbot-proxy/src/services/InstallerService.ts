import {
  Installation, InstallationQuery, InstallationStore, InstallProvider,
} from '@slack/oauth';
import { Service } from '@tsed/di';


const installationStore: InstallationStore = {
  storeInstallation: async(installation: Installation<'v1' | 'v2', boolean>) => {
    console.log({ installation });
  },
  fetchInstallation: async(installQuery: InstallationQuery<boolean>) => {
    const installation: Installation<'v1' | 'v2', boolean> = {
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
};

@Service()
export class InstallerService {

  installer: InstallProvider;

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

    this.installer = new InstallProvider({
      clientId,
      clientSecret,
      stateSecret,
      installationStore,
    });
  }

}
