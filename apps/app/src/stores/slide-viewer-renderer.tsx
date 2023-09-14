import useSWR, { type SWRResponse } from 'swr';

import type { RendererOptions } from '~/interfaces/renderer-options';
import { useRendererConfig } from '~/stores/context';
import { useCurrentPagePath } from '~/stores/page';


export const usePresentationViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['presentationViewOptions', currentPagePath, rendererConfig]
      : null,
    async([, currentPagePath, rendererConfig]) => {
      const { generatePresentationViewOptions } = await import('~/client/services/renderer/slide-viewer-renderer');
      return generatePresentationViewOptions(rendererConfig, currentPagePath);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
