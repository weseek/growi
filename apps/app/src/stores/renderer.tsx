import { useCallback } from 'react';

import type { HtmlElementNode } from 'rehype-toc';
import useSWR, { type SWRResponse } from 'swr';

import { getGrowiFacade } from '~/features/growi-plugin/utils/growi-facade-utils.client';
import type { RendererOptions } from '~/interfaces/renderer-options';


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
  const customGenerater = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGenerateViewOptions;

  return useSWR(
    isAllDataValid
      ? ['viewOptions', currentPagePath, rendererConfig, customGenerater]
      : null,
    async([, currentPagePath, rendererConfig]) => {
      if (customGenerater != null) {
        return customGenerater(currentPagePath, rendererConfig, storeTocNodeHandler);
      }

      const { generateViewOptions } = await import('~/client/services/renderer/renderer');
      return generateViewOptions(currentPagePath, rendererConfig, storeTocNodeHandler);
    },
    {
      keepPreviousData: true,
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
    async([, , tocNode, rendererConfig]) => {
      const { generateTocOptions } = await import('~/client/services/renderer/renderer');
      return generateTocOptions(rendererConfig, tocNode);
    },
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};

export const usePreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;
  const customGenerater = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGeneratePreviewOptions;

  return useSWR(
    isAllDataValid
      ? ['previewOptions', rendererConfig, currentPagePath, customGenerater]
      : null,
    async([, rendererConfig, pagePath]) => {
      if (customGenerater != null) {
        return customGenerater(rendererConfig, pagePath);
      }

      const { generatePreviewOptions } = await import('~/client/services/renderer/renderer');
      return generatePreviewOptions(rendererConfig, pagePath);
    },
    {
      keepPreviousData: true,
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
    async([, rendererConfig, currentPagePath]) => {
      const { generateSimpleViewOptions } = await import('~/client/services/renderer/renderer');
      return generateSimpleViewOptions(
        rendererConfig,
        currentPagePath,
        undefined,
        rendererConfig.isEnabledLinebreaksInComments,
      );
    },
    {
      keepPreviousData: true,
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
    async([, rendererConfig, pagePath, highlightKeywords]) => {
      const { generateSimpleViewOptions } = await import('~/client/services/renderer/renderer');
      return generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords);
    },
    {
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
    async([, rendererConfig]) => {
      const { generateSimpleViewOptions } = await import('~/client/services/renderer/renderer');
      return generateSimpleViewOptions(rendererConfig, '/');
    },
    {
      keepPreviousData: true,
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
    async([, currentPagePath, rendererConfig]) => {
      const { generatePresentationViewOptions } = await import('~/client/services/renderer/renderer');
      return generatePresentationViewOptions(rendererConfig, currentPagePath);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
};
