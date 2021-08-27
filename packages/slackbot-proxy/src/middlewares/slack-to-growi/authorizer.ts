import { AuthorizeResult, InstallationQuery } from '@slack/oauth';
import {
  IMiddleware, Inject, Middleware, Req, Res,
} from '@tsed/common';

import Logger from 'bunyan';

import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
// import { InstallationRepository } from '~/repositories/installation';
import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';


const getCommomMiddleware = (installerService, logger) => {
  return async(req:SlackOauthReq, res:Res):Promise<void|Res> => {
    const { body } = req;

    let teamId;
    let enterpriseId;
    let isEnterpriseInstall;

    // extract id from body
    if (body.payload != null) { // case: interactions
      const payload = JSON.parse(body.payload);
      teamId = payload.team?.id;
      enterpriseId = payload.enterprise?.id;
      isEnterpriseInstall = payload.is_enterprise_install === 'true';
    }
    else { // case: commands, events
      teamId = body.team_id;
      enterpriseId = body.enterprise_id;
      isEnterpriseInstall = body.is_enterprise_install === 'true';
    }

    if (teamId == null && enterpriseId == null) {
      res.writeHead(400, 'No installation found');
      return res.end();
    }

    // create query from body
    const query: InstallationQuery<boolean> = {
      teamId,
      enterpriseId,
      isEnterpriseInstall,
    };

    let result: AuthorizeResult;
    try {
      result = await installerService.installer.authorize(query);

      if (result.botToken == null) {
        res.writeHead(403, `The installation for the team(${query.teamId || query.enterpriseId}) has no botToken`);
        return res.end();
      }
    }
    catch (e) {
      logger.error(e.message);

      res.writeHead(500, e.message);
      return res.end();
    }

    // set authorized data
    req.authorizeResult = result;
  };
};
@Middleware()
export class AuthorizeCommandMiddleware implements IMiddleware {

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeCommandMiddleware');
  }

  @Inject()
  installerService: InstallerService;

  async use(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|Res> {
    const commonMiddleware = getCommomMiddleware(this.installerService, this.logger);
    await commonMiddleware(req, res);
  }

}

@Middleware()
export class AuthorizeInteractionMiddleware implements IMiddleware {

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeInteractionMiddleware');
  }

    @Inject()
    installerService: InstallerService;

    async use(@Req() req: SlackOauthReq, @Res() res:Res): Promise<void> {
      const { body } = req;

      if (body.payload == null) {
      // do nothing
        this.logger.info('body does not have payload');
        return;
      }

      const commonMiddleware = getCommomMiddleware(this.installerService, this.logger);
      await commonMiddleware(req, res);
    }

}
@Middleware()
export class AuthorizeEventsMiddleware implements IMiddleware {

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeEventsMiddleware');
  }

  @Inject()
  installerService: InstallerService;

  async use(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void|Res> {
    const commonMiddleware = getCommomMiddleware(this.installerService, this.logger);
    await commonMiddleware(req, res);
  }

}
