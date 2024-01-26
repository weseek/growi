import React from 'react';

import type { RendererOptions } from '~/interfaces/renderer-options';

import RevisionRenderer from '../Page/RevisionRenderer';


import styles from './Preview.module.scss';

const moduleClass = styles['page-editor-preview-body'] ?? '';


type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string | null,
  expandContentWidth?: boolean,
  pastEnd?: number,
  onScroll?: (scrollTop: number) => void,
}

const Preview = React.forwardRef((props: Props): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath, pastEnd,
    expandContentWidth,
  } = props;

  const fluidLayoutClass = expandContentWidth ? 'fluid-layout' : '';

  return (
    <div
      data-testid="page-editor-preview-body"
      className={`${moduleClass} ${fluidLayoutClass} ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      style={{ paddingBottom: pastEnd }}
    >
      { markdown != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
