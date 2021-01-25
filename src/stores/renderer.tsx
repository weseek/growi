import { responseInterface } from 'swr';

import footnotes from 'remark-footnotes';

import MarkdownRenderer from '~/service/renderer/markdown-renderer';

import { useStaticSWR } from './use-static-swr';

export const useViewRenderer = (): responseInterface<MarkdownRenderer, any> => {
  const key = 'viewRenderer';

  const { data } = useStaticSWR(key);

  let initialData: MarkdownRenderer | undefined;
  if (data == null) {
    const renderer = new MarkdownRenderer();
    renderer.attachers.push(footnotes);
    renderer.init();
    initialData = renderer;
  }

  return useStaticSWR(key, initialData);
};
