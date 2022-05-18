import { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { apiv3Get } from '~/client/util/apiv3-client';
import { IEditorSettings } from '~/interfaces/editor-settings';

import { useIsGuestUser } from './context';
import { useStaticSWR } from './use-static-swr';

export const useIsSlackEnabled = (isEnabled?: boolean): SWRResponse<boolean, Error> => {
  return useStaticSWR('isSlackEnabled', isEnabled, { fallbackData: false });
};

export const useEditorSettings = (): SWRResponse<IEditorSettings, Error> => {
  const { data: isGuestUser } = useIsGuestUser();

  return useSWRImmutable(
    isGuestUser ? null : '/personal-setting/editor-settings',
    endpoint => apiv3Get(endpoint).then(result => result.data),
  );
};
