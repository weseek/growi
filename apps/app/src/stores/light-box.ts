import { useCallback, useMemo } from 'react';

import type { SWRResponse } from 'swr';

import { useStaticSWR } from './use-static-swr';

export type LightBoxStatus = {
  toggler: boolean,
  attachmentId?: string
}

type LightBoxUtils = {
  lightBoxController(attachmentId: string): Promise<void>,
}

export const useLightBox = (): SWRResponse<LightBoxStatus, Error> & LightBoxUtils => {
  const initialStatus: LightBoxStatus = useMemo(() => {
    return {
      toggler: false,
      attachmentId: undefined,
    };
  }, []);

  const swrResponse = useStaticSWR<LightBoxStatus, Error>('LightBox', undefined, { fallbackData: initialStatus });
  const { mutate } = swrResponse;

  const lightBoxController = useCallback(async(attachmentId: string) => {
    await mutate({
      toggler: !swrResponse.data?.toggler ?? false,
      attachmentId,
    });
  }, [mutate, swrResponse.data?.toggler]);

  return {
    lightBoxController,
    ...swrResponse,
  };
};
