import toc, { HtmlElementNode } from 'rehype-toc';
import { Key, SWRResponse } from 'swr';
import useSWRImmutable from 'swr/immutable';


import {
  ReactMarkdownOptionsGenerator, RendererOptions,
  generateViewOptions, generatePreviewOptions, generateCommentPreviewOptions, generateOthersOptions, generateTocOptions,
} from '~/services/renderer/renderer';

import { useCurrentPageTocNode, useRendererConfig } from './context';

// The base hook with common processes
const _useOptionsBase = (
    rendererId: string, generator: ReactMarkdownOptionsGenerator, customizer?: (options: RendererOptions) => void,
): SWRResponse<RendererOptions, Error> => {
  const { data: rendererConfig } = useRendererConfig();

  const isAllDataValid = rendererConfig != null;

  const key = isAllDataValid
    ? [rendererId, rendererConfig]
    : null;

  const swrResult = useSWRImmutable<RendererOptions, Error>(key);

  if (isAllDataValid && swrResult.data == null) {
    swrResult.mutate(generator(rendererConfig, customizer));
  }

  // call useSWRImmutable again to foce to update cache
  return useSWRImmutable<RendererOptions, Error>(key);
};

export const useViewOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'viewOptions';

  const { mutate: storeTocNode } = useCurrentPageTocNode();

  const customizer = (options: RendererOptions) => {
    const { rehypePlugins } = options;
    // store toc node in global state
    if (rehypePlugins != null) {
      rehypePlugins.push([toc, {
        headings: ['h1', 'h2', 'h3'],
        customizeTOC: storeTocNode,
      }]);
    }
  };

  return _useOptionsBase(key, generateViewOptions, customizer);
};

export const useTocOptions = (): SWRResponse<RendererOptions, Error> => {
  const key = 'tocOptions';

  const { data: tocNode } = useCurrentPageTocNode();

  const customizer = (options: RendererOptions) => {
    const { rehypePlugins } = options;
    // set toc node
    if (rehypePlugins != null) {
      rehypePlugins.push([toc, {
        headings: ['h1', 'h2', 'h3'],
        customizeTOC: () => tocNode,
      }]);
    }
  };

  return _useOptionsBase(key, generateTocOptions, customizer);
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
