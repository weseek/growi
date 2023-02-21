import type { KnownBlock, Block } from '@slack/web-api';

export type RespondBodyForResponseUrl = {
  text?: string,
  blocks?: (KnownBlock | Block)[],
};
