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

    // use await import in order to avoid typescript-eslint error
    const fs = await import('fs');
    const growiBotVersion = JSON.parse(fs.readFileSync('../../package.json', 'utf8')).version;

    return { url, isOfficialMode, growiBotVersion };
  }

}
