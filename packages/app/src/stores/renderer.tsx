import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { RendererSettings } from '~/interfaces/services/renderer';
import {
  ReactMarkdownOptionsGenerator, RendererOptions,
  generateViewOptions, generatePreviewOptions, generateCommentPreviewOptions, generateOthersOptions,
} from '~/services/renderer/growi-renderer';
import { useStaticSWR } from '~/stores/use-static-swr';

import { useCurrentPagePath, useGrowiRendererConfig } from './context';

export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, Error> => {
  return useStaticSWR('rendererSettings', initialData);
};

// The base hook with common processes
const _useOptionsBase = (rendererId: string, generator: ReactMarkdownOptionsGenerator): SWRResponse<RendererOptions, Error> => {
  const { data: rendererSettings } = useRendererSettings();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  const isAllDataValid = rendererSettings != null && growiRendererConfig != null;

  const key = isAllDataValid
    ? [rendererId, rendererSettings, growiRendererConfig]
    : null;

  const swrResult = useSWRImmutable<RendererOptions, Error>(key);

  if (isAllDataValid && swrResult.data == null) {
    swrResult.mutate(generator(growiRendererConfig, rendererSettings));
  }

  // call useSWRImmutable again to foce to update cache
  return useSWRImmutable<RendererOptions, Error>(key);
};

export const useViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'viewOptions';

  return _useOptionsBase(key, generateViewOptions);
};

export const usePreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'previewOptions';

  return _useOptionsBase(key, generatePreviewOptions);
};

export const useCommentPreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'commentPreviewOptions';

  return _useOptionsBase(key, generateCommentPreviewOptions);
};

export const useSearchResultOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'searchResultOptions';

  return _useOptionsBase(key, generateOthersOptions);
};

export const useTimelineOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'timelineOptions';

  return _useOptionsBase(key, generateOthersOptions);
};

export const useDraftOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'draftOptions';

  return _useOptionsBase(key, generateOthersOptions);
};

export const useCustomSidebarOptions = (): SWRResponse<RendererOptions, Error> => {
  const key: Key = 'customSidebarOptions';

  return _useOptionsBase(key, generateOthersOptions);
};
