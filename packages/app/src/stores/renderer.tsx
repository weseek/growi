import { Key, SWRResponse } from 'swr';

import { RendererSettings } from '~/interfaces/services/renderer';
import GrowiRenderer, {
  generateCommentPreviewRenderer, generatePreviewRenderer, generateViewRenderer, RendererGenerator,
} from '~/services/renderer/growi-renderer';
import { useStaticSWR } from '~/stores/use-static-swr';

import { useCurrentPagePath, useGrowiRendererConfig } from './context';

export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

// The base hook with common processes
const _useRendererBase = (key: Key, generator: RendererGenerator): SWRResponse<GrowiRenderer, any> => {
  let _key = key;

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    _key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generator(growiRendererConfig, rendererSettings, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(_key);
};

export const useViewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'viewRenderer';

  return _useRendererBase(key, generateViewRenderer);
};

export const usePreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'previewRenderer';

  return _useRendererBase(key, generatePreviewRenderer);
};

export const useCommentPreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'commentPreviewRenderer';

  return _useRendererBase(key, generateCommentPreviewRenderer);
};

export const useSearchResultRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'searchResultRenderer';

  return _useRendererBase(key, generateViewRenderer);
};

export const useTimelineRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'timelineRenderer';

  return _useRendererBase(key, generateViewRenderer);
};

export const useDraftRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'draftRenderer';

  return _useRendererBase(key, generateViewRenderer);
};

export const useCustomSidebarRenderer = (): SWRResponse<GrowiRenderer, any> => {
  const key: Key = 'customSidebarRenderer';

  return _useRendererBase(key, generateViewRenderer);
};
