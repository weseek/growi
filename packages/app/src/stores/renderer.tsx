import {
  useCallback, useEffect, useRef,
} from 'react';

import { HtmlElementNode } from 'rehype-toc';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import {
  RendererOptions,
  generateSimpleViewOptions, generatePreviewOptions,
  generateViewOptions, generateTocOptions,
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

  const tocRef = useRef<HtmlElementNode|undefined>();

  const storeTocNodeHandler = useCallback((toc: HtmlElementNode) => {
    tocRef.current = toc;
  }, []);

  useEffect(() => {
    mutateCurrentPageTocNode(tocRef.current);
  // using useRef not to re-render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutateCurrentPageTocNode, tocRef.current]);

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
    },
  );
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: tocNode } = useCurrentPageTocNode();

  const isAllDataValid = currentPagePath != null && rendererConfig != null && tocNode != null;

  return useSWRImmutable(
    isAllDataValid
      ? ['tocOptions', currentPagePath, tocNode, rendererConfig]
      : null,
    ([, , tocNode, rendererConfig]) => generateTocOptions(rendererConfig, tocNode),
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateTocOptions(rendererConfig, tocNode) : undefined,
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
    },
  );
};

export const useCommentForCurrentPageOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  return useSWRImmutable(
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
    },
  );
};
export const useCommentPreviewOptions = useCommentForCurrentPageOptions;

export const useSelectedPagePreviewOptions = (pagePath: string, highlightKeywords?: string | string[]): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  return useSWRImmutable(
    isAllDataValid
      ? ['selectedPagePreviewOptions', rendererConfig, pagePath, highlightKeywords]
      : null,
    ([, rendererConfig, pagePath, highlightKeywords]) => generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords) : undefined,
    },
  );
};
export const useSearchResultOptions = useSelectedPagePreviewOptions;

export const useTimelineOptions = useSelectedPagePreviewOptions;

export const useCustomSidebarOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  return useSWRImmutable(
    isAllDataValid
      ? ['customSidebarOptions', rendererConfig]
      : null,
    ([, rendererConfig]) => generateSimpleViewOptions(rendererConfig, '/'),
    {
      keepPreviousData: true,
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, '/') : undefined,
    },
  );
};
