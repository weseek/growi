import React, {
  useCallback, useEffect, useMemo, useRef, useState,
} from 'react';

import EventEmitter from 'events';

import { useTranslation } from 'next-i18next';
import { debounce } from 'throttle-debounce';

import { CustomWindow } from '~/interfaces/global';
import { IGraphViewer, isGraphViewer } from '~/interfaces/graph-viewer';

import NotAvailableForGuest from './NotAvailableForGuest';

type Props = {
  GraphViewer: IGraphViewer,
  drawioContent: string,
  rangeLineNumberOfMarkdown: { beginLineNumber: number, endLineNumber: number },
  isPreview?: boolean,
}

// It calls callback when GraphViewer is not null.
// eslint-disable-next-line @typescript-eslint/ban-types
const waitForGraphViewer = async(callback: Function) => {
  const MAX_WAIT_COUNT = 10; // no reason for 10

  for (let i = 0; i < MAX_WAIT_COUNT; i++) {
    if (isGraphViewer((window as CustomWindow).GraphViewer)) {
      callback((window as CustomWindow).GraphViewer);
      break;
    }
    // Sleep 500 ms
    // eslint-disable-next-line no-await-in-loop
    await new Promise<void>(r => setTimeout(() => r(), 500));
  }
};

const Drawio = (props: Props): JSX.Element => {

  const { t } = useTranslation();

  // Wrap with a function since GraphViewer is a function.
  // This applies when call setGraphViewer as well.
  const [GraphViewer, setGraphViewer] = useState<IGraphViewer | undefined>(() => (window as CustomWindow).GraphViewer);

  const { drawioContent, rangeLineNumberOfMarkdown, isPreview } = props;

  // const { open: openDrawioModal } = useDrawioModalForPage();

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const globalEmitter: EventEmitter = (window as CustomWindow).globalEmitter;

  const editButtonClickHandler = useCallback(() => {
    const { beginLineNumber, endLineNumber } = rangeLineNumberOfMarkdown;
    globalEmitter.emit('launchDrawioModal', beginLineNumber, endLineNumber);
  }, [rangeLineNumberOfMarkdown, globalEmitter]);

  const renderDrawio = useCallback((GraphViewer: IGraphViewer) => {
    if (drawioContainerRef.current == null) {
      return;
    }

    const mxgraphs = drawioContainerRef.current.getElementsByClassName('mxgraph');
    if (mxgraphs.length > 0) {
      // GROWI では、mxgraph element は最初のものをレンダリングする前提とする
      const div = mxgraphs[0];

      if (div != null) {
        div.innerHTML = '';
        GraphViewer.createViewerForElement(div);
      }
    }
  }, [drawioContainerRef]);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  useEffect(() => {
    if (GraphViewer == null) {
      waitForGraphViewer((gv: IGraphViewer) => {
        setGraphViewer(() => gv);
      });
      return;
    }

    renderDrawioWithDebounce(GraphViewer);
  }, [renderDrawioWithDebounce, GraphViewer]);

  return (
    <div className="editable-with-drawio position-relative">
      { !isPreview && (
        <NotAvailableForGuest>
          <button type="button" className="drawio-iframe-trigger position-absolute btn btn-outline-secondary" onClick={editButtonClickHandler}>
            <i className="icon-note mr-1"></i>{t('Edit')}
          </button>
        </NotAvailableForGuest>
      ) }
      <div
        className="drawio"
        style={
          {
            borderRadius: 3,
            border: '1px solid #d7d7d7',
            margin: '20px 0',
          }
        }
        ref={drawioContainerRef}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: drawioContent }}
      >
      </div>
    </div>
  );

};

export default Drawio;
