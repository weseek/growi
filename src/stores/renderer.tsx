import { keyInterface, SWRResponse } from 'swr';

import { HtmlElementNode } from 'rehype-toc';

import { RendererSettings } from '~/interfaces/renderer';

import MarkdownRenderer, { generateViewRenderer } from '~/service/renderer/markdown-renderer';

import { useStaticSWR } from './use-static-swr';


export const useRendererSettings = (initialData?: RendererSettings): SWRResponse<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useCurrentPageTocNode = (): SWRResponse<HtmlElementNode, any> => {
  return useStaticSWR('currentPageTocNode');
};

export const useViewRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'viewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();
  const { mutate: mutateTocNode } = useCurrentPageTocNode();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings, toc => mutateTocNode(toc));
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const usePreviewRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'previewRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useSearchResultRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'searchResultRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useTimelineRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'timelineRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useDraftRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'draftRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};

export const useCustomSidebarRenderer = (): SWRResponse<MarkdownRenderer, any> => {
  let key: keyInterface = 'customSidebarRenderer';

  const { data: renderer, mutate: mutateRenderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    const generated = generateViewRenderer(rendererSettings);
    mutateRenderer(generated);
  }

  return useStaticSWR(key);
};
