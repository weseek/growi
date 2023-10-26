import React, {
  SyntheticEvent, RefObject,
} from 'react';

import type { RendererOptions } from '~/interfaces/renderer-options';

import RevisionRenderer from '../Page/RevisionRenderer';


import styles from './Preview.module.scss';

const moduleClass = styles['page-editor-preview-body'];


type Props = {
  rendererOptions: RendererOptions,
  markdown?: string,
  pagePath?: string | null,
  onScroll?: (scrollTop: number) => void,
}

const Preview = React.forwardRef((props: Props, ref: RefObject<HTMLDivElement>): JSX.Element => {

  const {
    rendererOptions,
    markdown, pagePath,
  } = props;

  return (
    <div
      className={`${moduleClass} ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      ref={ref}
      onScroll={(event: SyntheticEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          props.onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      { markdown != null && (
        <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
