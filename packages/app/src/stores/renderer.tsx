import { HtmlElementNode } from 'rehype-toc';
import useSWR, { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';

import { RendererConfig } from '~/interfaces/services/renderer';
import {
  RendererOptions,
  generateSimpleViewOptions, generatePreviewOptions, generateOthersOptions,
  generateViewOptions, generateTocOptions,
} from '~/services/renderer/renderer';
import { getGrowiFacade } from '~/utils/growi-facade';


import {
  useRendererConfig,
} from './context';
import { useCurrentPagePath } from './page';
import { useCurrentPageTocNode } from './ui';

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

export const useViewOptions = (storeTocNodeHandler: (toc: HtmlElementNode) => void): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  const key = isAllDataValid
    ? ['viewOptions', currentPagePath, rendererConfig]
    : null;

  return useSWR<RendererOptions, Error>(
    key,
    (rendererId, currentPagePath, rendererConfig) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGenerateViewOptions ?? generateViewOptions;
      return optionsGenerator(currentPagePath, rendererConfig, storeTocNodeHandler);
    },
    {
      fallbackData: isAllDataValid ? generateViewOptions(currentPagePath, rendererConfig, storeTocNodeHandler) : undefined,
    },
  );
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: tocNode } = useCurrentPageTocNode();

  const isAllDataValid = rendererConfig != null;

  const key = isAllDataValid
    ? ['tocOptions', currentPagePath, tocNode, rendererConfig]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, path, tocNode, rendererConfig) => generateTocOptions(rendererConfig, tocNode),
  );
};

export const usePreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  const key = isAllDataValid
    ? ['previewOptions', rendererConfig, currentPagePath]
    : null;

  return useSWR<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, pagePath, highlightKeywords) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGeneratePreviewOptions ?? generatePreviewOptions;
      return optionsGenerator(rendererConfig, pagePath, highlightKeywords);
    },
    {
      fallbackData: isAllDataValid ? generatePreviewOptions(rendererConfig, currentPagePath) : undefined,
    },
  );
};

export const useCommentForCurrentPageOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = currentPagePath != null && rendererConfig != null;

  const key = isAllDataValid
    ? ['commentPreviewOptions', rendererConfig, currentPagePath]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, currentPagePath) => generateSimpleViewOptions(rendererConfig, currentPagePath),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, currentPagePath) : undefined,
    },
  );
};
export const useCommentPreviewOptions = useCommentForCurrentPageOptions;

export const useSelectedPagePreviewOptions = (pagePath: string, highlightKeywords?: string | string[]): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  const key = isAllDataValid
    ? ['selectedPagePreviewOptions', rendererConfig, pagePath, highlightKeywords]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, pagePath, highlightKeywords) => generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, pagePath, highlightKeywords) : undefined,
    },
  );
};
export const useSearchResultOptions = useSelectedPagePreviewOptions;

export const useTimelineOptions = useSelectedPagePreviewOptions;

export const useDraftOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'draftOptions';

  return _useOptionsBase(key, generateOthersOptions);
};

export const useCustomSidebarOptions = (): SWRResponse<RendererOptions, Error> => {
  const key: Key = 'customSidebarOptions';

  return _useOptionsBase(key, generateOthersOptions);
};
