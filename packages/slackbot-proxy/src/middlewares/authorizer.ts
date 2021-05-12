import { AuthorizeResult, InstallationQuery } from '@slack/oauth';
import {
  IMiddleware, Inject, Middleware, Req, Res,
} from '@tsed/common';

import Logger from 'bunyan';

import { AuthedReq } from '~/interfaces/authorized-req';
import { InstallationRepository } from '~/repositories/installation';
import { InstallerService } from '~/services/InstallerService';
import loggerFactory from '~/utils/logger';

@Middleware()
export class AuthorizeCommandMiddleware implements IMiddleware {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeCommandMiddleware');
  }

  async use(@Req() req: AuthedReq, @Res() res: Res): Promise<void> {
    const { body } = req;

    // extract id from body
    const teamId = body.team_id;
    const enterpriseId = body.enterprise_id;
    const isEnterpriseInstall = body.is_enterprise_install === 'true';

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
        res.writeHead(403, `The installation for the team(${teamId || enterpriseId}) has no botToken`);
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
  }

}


@Middleware()
export class AuthorizeInteractionMiddleware implements IMiddleware {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  private logger: Logger;

  constructor() {
    this.logger = loggerFactory('slackbot-proxy:middlewares:AuthorizeInteractionMiddleware');
  }

  async use(@Req() req: AuthedReq, @Res() res: Res): Promise<void> {
    const { body } = req;

    if (body.payload == null) {
      // do nothing
      this.logger.info('body does not have payload');
      return;
    }

    const payload = JSON.parse(body.payload);

    // extract id from body
    const teamId = payload.team?.id;
    const enterpriseId = payload.enterprise?.id;
    const isEnterpriseInstall = payload.is_enterprise_install === 'true';

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
        res.writeHead(403, `The installation for the team(${teamId || enterpriseId}) has no botToken`);
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
  }

}
