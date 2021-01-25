import { responseInterface } from 'swr';


import MarkdownRenderer, { generateViewRenderer } from '~/service/renderer/markdown-renderer';

import { useStaticSWR } from './use-static-swr';

export const useViewRenderer = (): responseInterface<MarkdownRenderer, any> => {
  const key = 'viewRenderer';

  const { data } = useStaticSWR(key);

  let initialData: MarkdownRenderer | undefined;
  if (data == null) {
    initialData = generateViewRenderer();
  }

  return useStaticSWR(key, initialData);
};
