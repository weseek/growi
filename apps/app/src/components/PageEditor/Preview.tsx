import type { CSSProperties } from 'react';
import React, { useState } from 'react';

import type { UseSlide } from '@growi/presentation/dist/services';
import { parseSlideFrontmatterInMarkdown } from '@growi/presentation/dist/services';
import { useIsomorphicLayoutEffect } from 'usehooks-ts';

import type { RendererOptions } from '~/interfaces/renderer-options';

import RevisionRenderer from '../Page/RevisionRenderer';
import { SlideRenderer } from '../Page/SlideRenderer';

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

  const [parseFrontmatterResult, setParseFrontmatterResult] = useState<UseSlide|undefined>();

  const fluidLayoutClass = expandContentWidth ? 'fluid-layout' : '';

  useIsomorphicLayoutEffect(() => {
    if (markdown == null) return;

    (async() => {
      const parseFrontmatterResult = await parseSlideFrontmatterInMarkdown(markdown);

      if (parseFrontmatterResult != null) {
        setParseFrontmatterResult(parseFrontmatterResult);
      }
    })();
  }, []);

  return (
    <div
      data-testid="page-editor-preview-body"
      className={`${moduleClass} ${fluidLayoutClass} ${pagePath === '/Sidebar' ? 'preview-sidebar' : ''}`}
      style={style}
    >
      { markdown != null
        && (
          parseFrontmatterResult != null
            ? <SlideRenderer marp={parseFrontmatterResult.marp} markdown={markdown} />
            : <RevisionRenderer rendererOptions={rendererOptions} markdown={markdown}></RevisionRenderer>
        )
      }
    </div>
  );

};

export default Preview;
