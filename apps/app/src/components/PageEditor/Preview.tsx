import type {
  SyntheticEvent, RefObject,
} from 'react';
import React from 'react';

import { useSlidesByFrontmatter } from '@growi/presentation/dist/services';

import type { RendererOptions } from '~/interfaces/renderer-options';
import { useIsEnabledMarp } from '~/stores/context';

import RevisionRenderer from '../Page/RevisionRenderer';
import { SlideRenderer } from '../Page/SlideRenderer';


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

  const { data: isEnabledMarp } = useIsEnabledMarp();
  const isSlide = useSlidesByFrontmatter(markdown, isEnabledMarp);

  return (
    <div
      className={`page-editor-preview-body ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      ref={ref}
      onScroll={(event: SyntheticEvent<HTMLDivElement>) => {
        if (props.onScroll != null) {
          props.onScroll(event.currentTarget.scrollTop);
        }
      }}
    >
      { markdown != null && (
        isSlide != null
          ? <SlideRenderer marp={isSlide.marp} markdown={markdown} />
          : <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
      ) }
    </div>
  );

});

Preview.displayName = 'Preview';

export default Preview;
