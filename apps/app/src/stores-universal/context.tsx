import { AcceptedUploadFileType } from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type EventEmitter from 'events';
import type { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import type { SupportedActionType } from '~/interfaces/activity';
import {
  useIsUploadAllFileAllowed,
  useIsUploadEnabled,
} from '~/states/server-configurations';

import { useContextSWR } from './use-context-swr';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var globalEmitter: EventEmitter;
}

export const useAuditLogEnabled = (
  initialData?: boolean,
): SWRResponse<boolean, Error> => {
  return useContextSWR<boolean, Error>('auditLogEnabled', initialData, {
    fallbackData: false,
  });
};

export const useActivityExpirationSeconds = (
  initialData?: number,
): SWRResponse<number, Error> => {
  return useContextSWR<number, Error>('activityExpirationSeconds', initialData);
};

export const useAuditLogAvailableActions = (
  initialData?: Array<SupportedActionType>,
): SWRResponse<Array<SupportedActionType>, Error> => {
  return useContextSWR<Array<SupportedActionType>, Error>(
    'auditLogAvailableActions',
    initialData,
  );
};

export const useIsBlinkedHeaderAtBoot = (
  initialData?: boolean,
): SWRResponse<boolean, Error> => {
  return useContextSWR('isBlinkedAtBoot', initialData, { fallbackData: false });
};

export const useCustomizeTitle = (
  initialData?: string,
): SWRResponse<string, Error> => {
  return useContextSWR('CustomizeTitle', initialData);
};

export const useIsCustomizedLogoUploaded = (
  initialData?: boolean,
): SWRResponse<boolean, Error> => {
  return useSWRStatic('isCustomizedLogoUploaded', initialData);
};

export const useIsEnableUnifiedMergeView = (
  initialData?: boolean,
): SWRResponse<boolean, Error> => {
  return useSWRStatic<boolean, Error>('isEnableUnifiedMergeView', initialData, {
    fallbackData: false,
  });
};

/** **********************************************************
 *                     Computed contexts
 *********************************************************** */

export const useAcceptedUploadFileType = (): SWRResponse<
  AcceptedUploadFileType,
  Error
> => {
  const [isUploadEnabled] = useIsUploadEnabled();
  const [isUploadAllFileAllowed] = useIsUploadAllFileAllowed();

  return useSWRImmutable(
    ['acceptedUploadFileType', isUploadEnabled, isUploadAllFileAllowed],
    ([, isUploadEnabled, isUploadAllFileAllowed]) => {
      if (!isUploadEnabled) {
        return AcceptedUploadFileType.NONE;
      }
      if (isUploadAllFileAllowed) {
        return AcceptedUploadFileType.ALL;
      }
      return AcceptedUploadFileType.IMAGE;
    },
  );
};
