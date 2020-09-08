import { IncomingMessage } from 'http';
import { PlatformContext } from '@tsed/common';

export interface TsedIncomingMessage extends IncomingMessage {

  ctx: PlatformContext,

}
