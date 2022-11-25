import React, {
  ReactNode, useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import { debounce } from 'throttle-debounce';

import type { IGraphViewer } from '..';
import { generateMxgraphData } from '../utils/embed';
import { isGraphViewer } from '../utils/global';


import styles from './DrawioViewer.module.scss';


declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var GraphViewer: IGraphViewer;
}


export type DrawioViewerProps = {
  diagramIndex: number,
  bol?: number,
  eol?: number,
  children?: ReactNode,
  onRenderingStart?: () => void,
  onRenderingUpdated?: (hasError: boolean) => void,
}

export const DrawioViewer = React.memo((props: DrawioViewerProps): JSX.Element => {
  const {
    diagramIndex, bol, eol, children,
    onRenderingStart, onRenderingUpdated,
  } = props;

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const [error, setError] = useState<Error>();

  const renderDrawio = useCallback(() => {
    if (drawioContainerRef.current == null) {
      return;
    }

    if (!isGraphViewer(GraphViewer)) {
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
          GraphViewer.createViewerForElement(div);
        }
        catch (err) {
          setError(err);
          onRenderingUpdated?.(true);
        }
      }
    }
  }, [onRenderingUpdated]);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  const mxgraphHtml = useMemo(() => {
    setError(undefined);
    onRenderingStart?.();

    if (children == null) {
      return '';
    }

    const code = children instanceof Array
      ? children.map(e => e?.toString()).join('')
      : children.toString();

    let mxgraphData;
    try {
      mxgraphData = generateMxgraphData(code);
      onRenderingUpdated?.(false);
    }
    catch (err) {
      setError(err);
      onRenderingUpdated?.(true);
    }

    return `<div class="mxgraph" data-mxgraph="${mxgraphData}"></div>`;
  }, [children, onRenderingStart, onRenderingUpdated]);

  useEffect(() => {
    if (mxgraphHtml.length > 0) {
      renderDrawioWithDebounce();
    }
  }, [mxgraphHtml, renderDrawioWithDebounce]);

  return (
    <div
      key={`drawio-viewer-${diagramIndex}`}
      ref={drawioContainerRef}
      className={`drawio-viewer ${styles['drawio-viewer']} p-2`}
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
