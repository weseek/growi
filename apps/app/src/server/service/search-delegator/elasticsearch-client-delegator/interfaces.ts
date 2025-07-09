import type { ES7ClientDelegator } from './es7-client-delegator';
import type { ES8ClientDelegator } from './es8-client-delegator';
import type { ES9ClientDelegator } from './es9-client-delegator';

export type ElasticsearchClientDelegator = ES7ClientDelegator | ES8ClientDelegator | ES9ClientDelegator;

export const isES7Client = (delegator: ElasticsearchClientDelegator): delegator is ES7ClientDelegator => {
  return delegator.delegetorVersion === 7;
};

export const isES8Client = (delegator: ElasticsearchClientDelegator): delegator is ES8ClientDelegator => {
  return delegator.delegetorVersion === 8;
};

export const isES9Client = (delegator: ElasticsearchClientDelegator): delegator is ES9ClientDelegator => {
  return delegator.delegetorVersion === 9;
};
