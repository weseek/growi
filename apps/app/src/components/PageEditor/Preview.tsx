import type { CSSProperties } from 'react';
import React from 'react';

import { parseSlideFrontmatterInMarkdown } from '@growi/presentation';

import type { RendererOptions } from '~/interfaces/renderer-options';
import { useIsEnabledMarp } from '~/stores/context';

import RevisionRenderer from '../Page/RevisionRenderer';
import { SlideViewer } from '../ReactMarkdownComponents/SlideViewer';

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

  const { data: enabledMarp } = useIsEnabledMarp();
  const [marp, useSlide] = parseSlideFrontmatterInMarkdown(markdown);
  const useMarp = (enabledMarp ?? false) && marp;

  return (
    <div
      data-testid="page-editor-preview-body"
      className={`${moduleClass} ${fluidLayoutClass} ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      style={style}
    >
      { markdown != null
        && (
          (useMarp || useSlide)
            ? (<SlideViewer marp={useMarp}>{markdown}</SlideViewer>)
            : (<RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>)
        )
      }
    </div>
  );

};

export default Preview;
