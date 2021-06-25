import { Controller, Get } from '@tsed/common';

const isOfficialMode = process.env.OFFICIAL_MODE === 'true';

@Controller('/privacy')
export class SlackCtrl {

  @Get('/')
  async install(): Promise<string> {
    return 'Privary Policy';
  }

}
