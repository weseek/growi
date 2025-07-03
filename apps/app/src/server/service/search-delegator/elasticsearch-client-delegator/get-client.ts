import type { ClientOptions as ES7ClientOptions } from '@elastic/elasticsearch7';
import type { ClientOptions as ES8ClientOptions } from '@elastic/elasticsearch8';
import type { ClientOptions as ES9ClientOptions } from '@elastic/elasticsearch9';

import { ES7ClientDelegator } from './es7-client-delegator';
import { ES8ClientDelegator } from './es8-client-delegator';
import { ES9ClientDelegator } from './es9-client-delegator';

export type ElasticSEarchClientDeletegator = ES7ClientDelegator | ES8ClientDelegator | ES9ClientDelegator;

type GetDelegatorOptions = {
  version: 7;
  options: ES7ClientOptions;
  rejectUnauthorized: boolean;
} | {
  version: 8;
  options: ES8ClientOptions;
  rejectUnauthorized: boolean;
} | {
  version: 9;
  options: ES9ClientOptions;
  rejectUnauthorized: boolean;
}

type IsAny<T> = 'dummy' extends (T & 'dummy') ? true : false;
type Delegator<Opts extends GetDelegatorOptions> =
  IsAny<Opts> extends true
    ? ElasticSEarchClientDeletegator
    : Opts extends { version: 7 }
      ? ES7ClientDelegator
      : Opts extends { version: 8 }
        ? ES8ClientDelegator
        : Opts extends { version: 9 }
          ? ES9ClientDelegator
          : ElasticSEarchClientDeletegator

let instance: ElasticSEarchClientDeletegator;

export const getClient = <Opts extends GetDelegatorOptions>(opts: Opts): Delegator<Opts> => {
  if (instance == null) {
    if (opts.version === 7) {
      instance = new ES7ClientDelegator(opts.options, opts.rejectUnauthorized);
      return instance as Delegator<Opts>;
    }
    if (opts.version === 8) {
      instance = new ES8ClientDelegator(opts.options, opts.rejectUnauthorized);
      return instance as Delegator<Opts>;
    }
    if (opts.version === 9) {
      instance = new ES9ClientDelegator(opts.options, opts.rejectUnauthorized);
      return instance as Delegator<Opts>;
    }
  }

  return instance as Delegator<Opts>;
};
