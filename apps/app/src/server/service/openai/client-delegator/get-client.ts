import { OpenaiServiceType } from '~/interfaces/ai';

import { AzureOpenaiClientDelegator } from './azure-openai-client-delegator';
import type { IOpenaiClientDelegator } from './interfaces';
import { OpenaiClientDelegator } from './openai-client-delegator';

type GetDelegatorOptions = {
  openaiServiceType: OpenaiServiceType;
}
type Delegator<Opts = GetDelegatorOptions> = Opts extends { openaiServiceType: 'openai' }
  ? OpenaiClientDelegator
  : Opts extends { openaiServiceType: 'azure-openai' }
    ? AzureOpenaiClientDelegator
    : IOpenaiClientDelegator;

export const getClient = (opts: GetDelegatorOptions): Delegator => {
  if (opts.openaiServiceType === OpenaiServiceType.AZURE_OPENAI) {
    return new AzureOpenaiClientDelegator();
  }
  return new OpenaiClientDelegator();
};
