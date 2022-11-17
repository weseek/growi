import React, {
  ReactNode, useCallback, useEffect, useMemo, useRef,
} from 'react';

import { debounce } from 'throttle-debounce';

import { IGraphViewer } from '..';
import { generateMxgraphData } from '../utils/embed';
import { isGraphViewer } from '../utils/global';


import styles from './DrawioViewer.module.scss';


interface Window {
  // declare as an optional property
  //  because this might be undefined if before load.
  GraphViewer?: IGraphViewer,
}
declare const window: Window;


type Props = {
  diagramIndex: number,
  bol?: number,
  eol?: number,
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

    if (!isGraphViewer(window.GraphViewer)) {
      // Do nothing if loading has not been terminated.
      // Alternatively, GraphViewer.processElements() will be called in Script.onLoad.
      // see DrawioViewerScript.tsx
      return;
    }

    const mxgraphs = drawioContainerRef.current.getElementsByClassName('mxgraph');
    if (mxgraphs.length > 0) {
      // This component should have only one '.mxgraph' element
      const div = mxgraphs[0];

      if (div != null) {
        div.innerHTML = '';
        window.GraphViewer.createViewerForElement(div);
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
