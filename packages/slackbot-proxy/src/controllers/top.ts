import {
  Controller, Get, Inject, View,
} from '@tsed/common';

import { InstallerService } from '~/services/InstallerService';
import { requiredScopes } from '../../../slack/src/utils/required-scopes';

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
