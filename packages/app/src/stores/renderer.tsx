import { SWRResponse } from 'swr';

import GrowiRenderer from '~/client/util/GrowiRenderer';
import { RendererSettings } from '~/interfaces/services/renderer';
import { useStaticSWR } from '~/stores/use-static-swr';

export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useViewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};

export const usePreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};

export const useSearchResultRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};

export const useTimelineRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};

export const useDraftRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};

export const useCustomSidebarRenderer = (): SWRResponse<GrowiRenderer, any> => {
  return useStaticSWR('');
};
