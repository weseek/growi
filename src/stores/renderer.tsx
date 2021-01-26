import { keyInterface, responseInterface } from 'swr';

import { HtmlElementNode } from 'rehype-toc';

import { RendererSettings } from '~/interfaces/renderer';

import MarkdownRenderer, { generateViewRenderer } from '~/service/renderer/markdown-renderer';

import { useStaticSWR } from './use-static-swr';


export const useRendererSettings = (initialData?: RendererSettings): responseInterface<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useCurrentPageTocNode = (): responseInterface<HtmlElementNode, any> => {
  return useStaticSWR('currentPageTocNode');
};

export const useViewRenderer = (): responseInterface<MarkdownRenderer, any> => {
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
