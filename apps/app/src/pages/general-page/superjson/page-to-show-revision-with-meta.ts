import { isIPageInfo } from '@growi/core';
import type {
  IDataWithMeta,
} from '@growi/core';
import superjson from 'superjson';

import type { IPageToShowRevisionWithMeta } from '../types';

type IPageToShowRevisionWithMetaSerialized = IDataWithMeta<string, string>;

let isRegistered = false;

export const registerPageToShowRevisionWithMeta = (): void => {
  if (isRegistered) return;

  superjson.registerCustom<IPageToShowRevisionWithMeta, IPageToShowRevisionWithMetaSerialized>(
    {
      isApplicable: (v): v is IPageToShowRevisionWithMeta => {
        return v?.data != null
          && v?.data.toObject != null
          && isIPageInfo(v.meta);
      },
      serialize: (v) => {
        return {
          data: superjson.stringify(v.data.toObject()),
          meta: superjson.stringify(v.meta),
        };
      },
      deserialize: (v) => {
        return {
          data: superjson.parse(v.data),
          meta: v.meta != null ? superjson.parse(v.meta) : undefined,
        };
      },
    },
    'IPageToShowRevisionWithMetaTransformer',
  );

  isRegistered = true;
};
