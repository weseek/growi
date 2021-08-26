import { AuthorizeResult, InstallationQuery } from '@slack/oauth';
import {
  IMiddleware, Inject, Middleware, Req, Res,
} from '@tsed/common';

import Logger from 'bunyan';

import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';
import { InstallationRepository } from '~/repositories/installation';
import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';

class AuthorizerService {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeCommandMiddleware');
  }

   pushAuthorizedResultToRequest = async(req:SlackOauthReq, res:Res):Promise<void> => {
     const { body } = req;

     let teamId;
     let enterpriseId;
     let isEnterpriseInstall;

     // extract id from body
     if (body.payload != null) {
       const payload = JSON.parse(body.payload);
       teamId = payload.team?.id;
       enterpriseId = payload.enterprise?.id;
       isEnterpriseInstall = payload.is_enterprise_install === 'true';
     }
     else {
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
       result = await this.installerService.installer.authorize(query);

       if (result.botToken == null) {
         res.writeHead(403, `The installation for the team(${query.teamId || query.enterpriseId}) has no botToken`);
         return res.end();
       }
     }
     catch (e) {
       this.logger.error(e.message);

       res.writeHead(500, e.message);
       return res.end();
     }

     // set authorized data
     req.authorizeResult = result;
   };

}

@Middleware()
export class AuthorizeCommandMiddleware implements IMiddleware {

  @Inject()
  authorizerService: AuthorizerService;

  async use(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void> {
    await this.authorizerService.pushAuthorizedResultToRequest(req, res);
  }

}

@Middleware()
export class AuthorizeInteractionMiddleware implements IMiddleware {

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeInteractionMiddleware');
  }

  @Inject()
  authorizerService: AuthorizerService;

  async use(@Req() req: SlackOauthReq, @Res() res: Res): Promise<void> {
    const { body } = req;

    if (body.payload == null) {
      // do nothing
      this.logger.info('body does not have payload');
      return;
    }

    await this.authorizerService.pushAuthorizedResultToRequest(req, res);
  }

}
@Middleware()
export class AuthorizeEventsMiddleware implements IMiddleware {

  @Inject()
  authorizerService: AuthorizerService;

  async use(@Req() req: SlackOauthReq, @Res() res: Res): Promise<string|void> {
    await this.authorizerService.pushAuthorizedResultToRequest(req, res);
  }

}
