import { AuthorizeResult } from '@slack/oauth';

import { GrowiCommand } from './growi-command';
import { RequestFromSlack } from './request-from-slack';

export interface GrowiCommandProcessor {
  shouldHandleCommand(growiCommand: GrowiCommand): boolean;

  processCommand(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void>
}
