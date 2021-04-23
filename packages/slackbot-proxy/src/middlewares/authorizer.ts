import { InstallationQuery } from '@slack/oauth';
import {
  IMiddleware, Inject, Middleware, Req, Res,
} from '@tsed/common';

import { AuthedReq } from '~/interfaces/authorized-req';
import { InstallationRepository } from '~/repositories/installation';
import { InstallerService } from '~/services/InstallerService';

@Middleware()
export class AuthorizeMiddleware implements IMiddleware {

  @Inject()
  installerService: InstallerService;

  @Inject()
  installationRepository: InstallationRepository;

  async use(@Req() req: AuthedReq, @Res() res: Res): Promise<void> {
    const { body } = req;

    // extract id from body
    const teamId = body.team_id;
    const enterpriseId = body.enterprize_id;

    if (teamId == null && enterpriseId == null) {
      res.writeHead(400);
      return res.end();
    }

    // create query from body
    const query: InstallationQuery<boolean> = {
      teamId,
      enterpriseId,
      isEnterpriseInstall: body.is_enterprise_install === 'true',
    };

    const result = await this.installerService.installer.authorize(query);

    if (result.botToken == null) {
      res.writeHead(403);
      return res.end();
    }

    // set authorized data
    req.authorizeResult = result;
  }

}
