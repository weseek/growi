import {
  IMiddleware, Middleware, Next, Req, Res,
} from '@tsed/common';
import { parseSlashCommand } from '@growi/slack';
import { SlackOauthReq } from '~/interfaces/slack-to-growi/slack-oauth-req';


@Middleware()
export class checkCommandPermissionMiddleware implements IMiddleware {

  async use(@Req() req:SlackOauthReq & Request, @Res() res:Res, @Next() next: Next):Promise<void> {
    const { body, authorizeResult } = req;

    console.log(12, body);
    console.log(authorizeResult);

    const growiCommand = parseSlashCommand(body);
    console.log(growiCommand);

    const passCommandArray = ['status', 'register', 'unregister', 'help'];

    if (passCommandArray.includes(growiCommand.growiCommandType)) {
      console.log(22);
      next();
    }


  }

}
