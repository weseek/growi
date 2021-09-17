import {
  Controller, Get, Inject, View,
} from '@tsed/common';

import { requiredScopes } from '@growi/slack';
import { InstallerService } from '~/services/InstallerService';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';
const fs = require('fs');

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

    const growiBotVersion = JSON.parse(fs.readFileSync('../../package.json', 'utf8')).version;

    return { url, isOfficialMode, growiBotVersion };
  }

}
