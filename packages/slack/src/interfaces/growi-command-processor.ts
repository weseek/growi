import { AuthorizeResult } from '@slack/oauth';

import { GrowiCommand } from './growi-command';

export interface GrowiCommandProcessor {
  process(growiCommand: GrowiCommand, authorizeResult: AuthorizeResult, body: {[key:string]:string}): Promise<void>
}
