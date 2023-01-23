import dynamic from 'next/dynamic';

import type { RendererConfig } from '~/interfaces/services/renderer';
import { generateSSRViewOptions } from '~/services/renderer/renderer';

import RevisionRenderer from './RevisionRenderer';


type Props = {
  rendererConfig: RendererConfig,
  pagePath: string,
  markdownForSSR?: string,
}

export const Page2 = (props: Props): JSX.Element => {
  const { rendererConfig, pagePath, markdownForSSR: markdown } = props;

  const rendererOptions = generateSSRViewOptions(rendererConfig, pagePath);

  const Page = dynamic(() => import('./Page').then(mod => mod.Page), {
    ssr: false,
    loading: () => <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown ?? ''} />,
  });

  return <Page />;
};
