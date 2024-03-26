import type { CSSProperties } from 'react';
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
  style?: CSSProperties,
  onScroll?: (scrollTop: number) => void,
}

const Preview = (props: Props): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath, style,
    expandContentWidth,
  } = props;

  const fluidLayoutClass = expandContentWidth ? 'fluid-layout' : '';

  return (
    <div
      className={`${moduleClass} ${fluidLayoutClass} ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      style={style}
    >
      { markdown != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

};

export default Preview;
