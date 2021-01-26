import { keyInterface, responseInterface } from 'swr';

import { RendererSettings } from '~/interfaces/renderer';
import MarkdownRenderer, { generateViewRenderer } from '~/service/renderer/markdown-renderer';

import { useStaticSWR } from './use-static-swr';


export const useRendererSettings = (initialData?: RendererSettings): responseInterface<RendererSettings, any> => {
  return useStaticSWR('rendererSettings', initialData);
};

export const useViewRenderer = (): responseInterface<MarkdownRenderer, any> => {
  let key: keyInterface = 'viewRenderer';
  let initialData: MarkdownRenderer | undefined;

  const { data: renderer } = useStaticSWR(key);
  const { data: rendererSettings } = useRendererSettings();

  // return null key
  if (rendererSettings == null) {
    key = null;
  }
  // initialize renderer
  else if (renderer == null) {
    initialData = generateViewRenderer(rendererSettings);
  }

  return useStaticSWR(key, initialData);
};
