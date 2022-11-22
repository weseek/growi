import React, {
  ReactNode, useCallback, useEffect, useMemo, useRef, useState,
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

export const DrawioViewer = React.memo((props: Props): JSX.Element => {
  const {
    diagramIndex, bol, eol, children,
  } = props;

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<Error>();

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

        try {
          window.GraphViewer.createViewerForElement(div);
        }
        catch (err) {
          setError(err);
        }
      }
    }
  }, [drawioContainerRef]);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  const mxgraphHtml = useMemo(() => {
    setError(undefined);

    if (children == null) {
      return '';
    }

    const code = children instanceof Array
      ? children.map(e => e?.toString()).join('')
      : children.toString();

    let mxgraphData;
    try {
      mxgraphData = generateMxgraphData(code);
    }
    catch (err) {
      setError(err);
    }

    return `<div class="mxgraph" data-mxgraph="${mxgraphData}"></div>`;
  }, [children]);

  useEffect(() => {
    if (mxgraphHtml.length > 0) {
      renderDrawioWithDebounce();
    }
  }, [mxgraphHtml, renderDrawioWithDebounce]);

  return (
    <div
      key={`drawio-viewer-${diagramIndex}`}
      ref={drawioContainerRef}
      className={`drawio-viewer ${styles['drawio-viewer']}`}
      data-begin-line-number-of-markdown={bol}
      data-end-line-number-of-markdown={eol}
    >
      {/* show error */}
      { error != null && (
        <span className="text-muted"><i className="icon-fw icon-exclamation"></i>
          {error.name && <strong>{error.name}: </strong>}
          {error.message}
        </span>
      ) }

      { error == null && (
        // eslint-disable-next-line react/no-danger
        <div dangerouslySetInnerHTML={{ __html: mxgraphHtml }} />
      ) }
    </div>
  );
});
DrawioViewer.displayName = 'DrawioViewer';
