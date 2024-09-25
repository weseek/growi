import { aiServiceType } from '~/interfaces/ai';

import { AzureOpenaiClientDelegator } from './azure-openai-client-delegator';
import type { IOpenaiClientDelegator } from './interfaces';
import { OpenaiClientDelegator } from './openai-client-delegator';

type GetDelegatorOptions = {
  aiServiceType: aiServiceType;
}
type Delegator<Opts = GetDelegatorOptions> = Opts extends { aiServiceType: 'openai' }
  ? OpenaiClientDelegator
  : Opts extends { aiServiceType: 'azure-openai' }
    ? AzureOpenaiClientDelegator
    : IOpenaiClientDelegator;

export const getClient = (opts: GetDelegatorOptions): Delegator => {
  if (opts.aiServiceType === aiServiceType.AZURE_OPENAI) {
    return new AzureOpenaiClientDelegator();
  }
  return new OpenaiClientDelegator();
};
