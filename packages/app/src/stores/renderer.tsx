import { Key, SWRResponse } from 'swr';

import GrowiRenderer, { generateCommentPreviewRenderer, generatePreviewRenderer, generateViewRenderer } from '~/client/util/GrowiRenderer';
import { RendererSettings } from '~/interfaces/services/renderer';
import { useStaticSWR } from '~/stores/use-static-swr';

export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useViewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'viewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const usePreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'previewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generatePreviewRenderer();
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useCommentPreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'commentPreviewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateCommentPreviewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useSearchResultRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'searchResultRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useTimelineRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'timelineRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useDraftRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'draftRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useCustomSidebarRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'customSidebarRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  if (rendererSettings == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};
