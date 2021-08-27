import {
  Controller, Get, Inject, View,
} from '@tsed/common';

import { requiredScopes } from '@growi/slack';
import { InstallerService } from '~/services/InstallerService';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';


@Controller('/')
export class TopCtrl {

  @Inject()
  installerService: InstallerService;

  @Get('/')
  @View('top.ejs')
  async getTopPage(): Promise<any> {
    const url = await this.installerService.installer.generateInstallUrl({
      // Add the scopes your app needs
      scopes: requiredScopes,
    });

    return { url, isOfficialMode };
  }

}
