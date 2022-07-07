import { Key, SWRResponse } from 'swr';

import { RendererSettings } from '~/interfaces/services/renderer';
import GrowiRenderer, { generateCommentPreviewRenderer, generatePreviewRenderer, generateViewRenderer } from '~/services/renderer/growi-renderer';
import { useStaticSWR } from '~/stores/use-static-swr';

import { useCurrentPagePath, useGrowiRendererConfig } from './context';

export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useViewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'viewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const usePreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'previewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generatePreviewRenderer(growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useCommentPreviewRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'commentPreviewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateCommentPreviewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useSearchResultRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'searchResultRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useTimelineRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'timelineRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useDraftRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'draftRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useCustomSidebarRenderer = (): SWRResponse<GrowiRenderer, any> => {
  let key: Key = 'customSidebarRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { data: currentPath } = useCurrentPagePath();
  const { data: growiRendererConfig } = useGrowiRendererConfig();

  if (rendererSettings == null || growiRendererConfig == null) {
    key = null;
  }
  // Initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, growiRendererConfig, currentPath);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};
