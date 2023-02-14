import { useCallback } from 'react';

import type { HtmlElementNode } from 'rehype-toc';
import useSWR, { type SWRResponse } from 'swr';

import {
  type RendererOptions,
  generateSimpleViewOptions, generatePreviewOptions,
  generateViewOptions, generateTocOptions, generatePresentationViewOptions,
} from '~/services/renderer/renderer';
import { getGrowiFacade } from '~/utils/growi-facade';


import {
  useRendererConfig,
} from './context';
import { useCurrentPagePath } from './page';
import { useCurrentPageTocNode } from './ui';


export const useViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { mutate: mutateCurrentPageTocNode } = useCurrentPageTocNode();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    mutateCurrentPageTocNode(toc, { revalidate: false });
  }, [mutateCurrentPageTocNode]);

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['viewOptions', currentPagePath, rendererConfig]
      : null,
    ([, currentPagePath, rendererConfig]) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGenerateViewOptions ?? generateViewOptions;
      return optionsGenerator(currentPagePath, rendererConfig, storeTocNodeHandler);
    },
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateViewOptions(currentPagePath, rendererConfig, storeTocNodeHandler) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: tocNode } = useCurrentPageTocNode();

  const isAllDataValid = currentPagePath != null && rendererConfig != null && tocNode != null;

  return useSWR(
    isAllDataValid
      ? ['tocOptions', currentPagePath, tocNode, rendererConfig]
      : null,
    ([, , tocNode, rendererConfig]) => generateTocOptions(rendererConfig, tocNode),
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateTocOptions(rendererConfig, tocNode) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const usePreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['previewOptions', rendererConfig, currentPagePath]
      : null,
    ([, rendererConfig, pagePath]) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGeneratePreviewOptions ?? generatePreviewOptions;
      return optionsGenerator(rendererConfig, pagePath);
    },
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generatePreviewOptions(rendererConfig, currentPagePath) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const useCommentForCurrentPageOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['commentPreviewOptions', rendererConfig, currentPagePath]
      : null,
    ([, rendererConfig, currentPagePath]) => generateSimpleViewOptions(
      rendererConfig,
      currentPagePath,
      undefined,
      rendererConfig.isEnabledLinebreaksInComments,
    ),
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateSimpleViewOptions(
        rendererConfig,
        currentPagePath,
        undefined,
        rendererConfig.isEnabledLinebreaksInComments,
      ) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
export const useCommentPreviewOptions = useCommentForCurrentPageOptions;

export const useSelectedPagePreviewOptions = (pagePath: string, highlightKeywords?: string | string[]): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['selectedPagePreviewOptions', rendererConfig, pagePath, highlightKeywords]
      : null,
    ([, rendererConfig, pagePath, highlightKeywords]) => generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
export const useSearchResultOptions = useSelectedPagePreviewOptions;

export const useTimelineOptions = useSelectedPagePreviewOptions;

export const useCustomSidebarOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['customSidebarOptions', rendererConfig]
      : null,
    ([, rendererConfig]) => generateSimpleViewOptions(rendererConfig, '/'),
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, '/') : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const usePresentationViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWR(
    isAllDataValid
      ? ['presentationViewOptions', currentPagePath, rendererConfig]
      : null,
    ([, currentPagePath, rendererConfig]) => generatePresentationViewOptions(rendererConfig, currentPagePath),
    {
      fallbackData: isAllDataValid ? generatePresentationViewOptions(rendererConfig, currentPagePath) : undefined,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
