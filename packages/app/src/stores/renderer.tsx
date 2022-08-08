import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { RendererConfig } from '~/interfaces/services/renderer';
import {
  RendererOptions,
  generatePreviewOptions, generateCommentPreviewOptions, generateOthersOptions,
  generateViewOptions, generateTocOptions,
} from '~/services/renderer/renderer';


import { useCurrentPagePath, useCurrentPageTocNode, useRendererConfig } from './context';

interface ReactMarkdownOptionsGenerator {
  (config: RendererConfig): RendererOptions
}

// The base hook with common processes
const _useOptionsBase = (
    rendererId: string, generator: ReactMarkdownOptionsGenerator,
): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  const key = isAllDataValid
    ? [rendererId, rendererConfig]
    : null;

  const swrResult = useSWRImmutable<RendererOptions, Error>(key);

  if (isAllDataValid && swrResult.data == null) {
    swrResult.mutate(generator(rendererConfig));
  }

  // call useSWRImmutable again to foce to update cache
  return useSWRImmutable<RendererOptions, Error>(key);
};

export const useViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { mutate: storeTocNode } = useCurrentPageTocNode();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  const key = isAllDataValid
    ? ['viewOptions', currentPagePath, rendererConfig]
    : null;

  const swrResult = useSWRImmutable<RendererOptions, Error>(key);

  if (isAllDataValid && swrResult.data == null) {
    swrResult.mutate(generateViewOptions(currentPagePath, rendererConfig, storeTocNode));
  }

  // call useSWRImmutable again to foce to update cache
  return useSWRImmutable<RendererOptions, Error>(key);
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'tocOptions';

  const { data: tocNode } = useCurrentPageTocNode();

  return _useOptionsBase(key, config => generateTocOptions(config, tocNode));
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
