import React, {
  ReactNode, useCallback, useEffect, useMemo, useRef,
} from 'react';

import { debounce } from 'throttle-debounce';

import { generateMxgraphData } from '../utils/embed';

import styles from './DrawioViewer.module.scss';

type Props = {
  diagramIndex: number,
  bol?: number,
  eol?: number,
  drawioEmbedUri?: string,
  children?: ReactNode,
}

export const DrawioViewer = (props: Props): JSX.Element => {
  const {
    diagramIndex, bol, eol, children,
  } = props;

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const renderDrawio = useCallback(() => {
    if (drawioContainerRef.current == null) {
      return;
    }

    const mxgraphs = drawioContainerRef.current.getElementsByClassName('mxgraph');
    if (mxgraphs.length > 0) {
      // GROWI では、mxgraph element は最初のものをレンダリングする前提とする
      const div = mxgraphs[0];

      if (div != null) {
        div.innerHTML = '';
        (window as any).GraphViewer.createViewerForElement(div);
      }
    }
  }, [drawioContainerRef]);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  useEffect(() => {
    renderDrawioWithDebounce();
  }, [renderDrawioWithDebounce]);


  if (children == null) {
    return <></>;
  }

  const code = children instanceof Array
    ? children.map(e => e?.toString()).join('')
    : children.toString();

  const mxgraphData = generateMxgraphData(code, diagramIndex);

  const mxgraphHtml = `<div class="mxgraph" data-mxgraph="${mxgraphData}"></div>`;

  return (
    <div
      key={`drawio-viewer-${diagramIndex}`}
      ref={drawioContainerRef}
      className={`drawio-viewer ${styles['drawio-viewer']}`}
      data-begin-line-number-of-markdown={bol}
      data-end-line-number-of-markdown={eol}
    >
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: mxgraphHtml }} />
    </div>
  );
};
