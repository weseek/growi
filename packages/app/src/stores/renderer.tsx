import { Schema as SanitizeOption } from 'hast-util-sanitize';
import { defaultSchema as sanitizeDefaultSchema } from 'rehype-sanitize';
import { HtmlElementNode } from 'rehype-toc';
import useSWR, { SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';
import deepmerge from 'ts-deepmerge';

import { RehypeSanitizeOption } from '~/interfaces/rehype';
import type { RendererConfig } from '~/interfaces/services/renderer';
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


const commonSanitizeAttributes = { '*': ['class', 'className', 'style'] };

const generateCommonSanitizeOption = (config: RendererConfig): SanitizeOption => {
  const commonSanitizeOption = deepmerge(
    sanitizeDefaultSchema,
    {
      clobberPrefix: 'mdcont-',
      attributes: commonSanitizeAttributes,
    },
  );

  // Inject custom SanitizeOptions
  if (config.xssOption === RehypeSanitizeOption.CUSTOM) {
    commonSanitizeOption.tagNames = config.tagWhiteList;
    commonSanitizeOption.attributes = deepmerge(commonSanitizeAttributes, config.attrWhiteList ?? {});
  }

  return commonSanitizeOption;
};

const useCommonSanitizeOption = (): SWRResponse<SanitizeOption, Error> => {
  const { data: rendererConfig } = useRendererConfig();
  const key = rendererConfig != null ? ['CommonSanitizeOptions', rendererConfig] : null;
  return useSWRImmutable(key, (rendererId, rendererConfig: RendererConfig) => generateCommonSanitizeOption(rendererConfig));
};

export const useViewOptions = (storeTocNodeHandler: (toc: HtmlElementNode) => void): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = currentPagePath != null && rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['viewOptions', currentPagePath, rendererConfig, commonSanitizeOption]
    : null;

  return useSWR<RendererOptions, Error>(
    key,
    (rendererId, currentPagePath, rendererConfig, commonSanitizeOption) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGenerateViewOptions ?? generateViewOptions;
      return optionsGenerator(currentPagePath, rendererConfig, commonSanitizeOption, storeTocNodeHandler);
    },
    {
      fallbackData: isAllDataValid ? generateViewOptions(currentPagePath, rendererConfig, commonSanitizeOption, storeTocNodeHandler) : undefined,
    },
  );
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: tocNode } = useCurrentPageTocNode();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['tocOptions', currentPagePath, tocNode, rendererConfig, commonSanitizeOption]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, path, tocNode, rendererConfig, commonSanitizeOption) => generateTocOptions(rendererConfig, commonSanitizeOption, tocNode),
  );
};

export const usePreviewOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = currentPagePath != null && rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['previewOptions', rendererConfig, currentPagePath, commonSanitizeOption]
    : null;

  return useSWR<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, pagePath, highlightKeywords) => {
      // determine options generator
      const optionsGenerator = getGrowiFacade().markdownRenderer?.optionsGenerators?.customGeneratePreviewOptions ?? generatePreviewOptions;
      return optionsGenerator(rendererConfig, pagePath, highlightKeywords);
    },
    {
      fallbackData: isAllDataValid ? generatePreviewOptions(rendererConfig, currentPagePath, commonSanitizeOption) : undefined,
    },
  );
};

export const useCommentForCurrentPageOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: currentPagePath } = useCurrentPagePath();
  const { data: rendererConfig } = useRendererConfig();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = currentPagePath != null && rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['commentPreviewOptions', rendererConfig, currentPagePath, commonSanitizeOption]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, currentPagePath, commonSanitizeOption) => generateSimpleViewOptions(
      rendererConfig,
      currentPagePath,
      commonSanitizeOption,
      undefined,
      rendererConfig.isEnabledLinebreaksInComments,
    ),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(
        rendererConfig,
        currentPagePath,
        commonSanitizeOption,
        undefined,
        rendererConfig.isEnabledLinebreaksInComments,
      ) : undefined,
    },
  );
};
export const useCommentPreviewOptions = useCommentForCurrentPageOptions;

export const useSelectedPagePreviewOptions = (pagePath: string, highlightKeywords?: string | string[]): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['selectedPagePreviewOptions', rendererConfig, pagePath, commonSanitizeOption, highlightKeywords]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, pagePath, commonSanitizeOption, highlightKeywords) => generateSimpleViewOptions(
      rendererConfig,
      pagePath,
      commonSanitizeOption,
      highlightKeywords,
    ),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, pagePath, commonSanitizeOption, highlightKeywords) : undefined,
    },
  );
};
export const useSearchResultOptions = useSelectedPagePreviewOptions;

export const useTimelineOptions = useSelectedPagePreviewOptions;

export const useCustomSidebarOptions = (): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();
  const { data: commonSanitizeOption } = useCommonSanitizeOption();

  const isAllDataValid = rendererConfig != null && commonSanitizeOption != null;

  const key = isAllDataValid
    ? ['customSidebarOptions', rendererConfig, commonSanitizeOption]
    : null;

  return useSWRImmutable<RendererOptions, Error>(
    key,
    (rendererId, rendererConfig, pagePath, commonSanitizeOption, highlightKeywords) => generateSimpleViewOptions(
      rendererConfig,
      pagePath,
      commonSanitizeOption,
      highlightKeywords,
    ),
    {
      fallbackData: isAllDataValid ? generateSimpleViewOptions(rendererConfig, '/', commonSanitizeOption) : undefined,
    },
  );
};
