import React, {
  useCallback, useEffect, useMemo, useRef,
} from 'react';

import EventEmitter from 'events';

import { useTranslation } from 'react-i18next';
import { debounce } from 'throttle-debounce';

import { CustomWindow } from '~/interfaces/global';
import { IGraphViewer } from '~/interfaces/graph-viewer';

import NotAvailableForGuest from './NotAvailableForGuest';

type Props = {
  drawioContent: string,
  rangeLineNumberOfMarkdown: { beginLineNumber: number, endLineNumber: number },
  isPreview?: boolean,
}

const Drawio = (props: Props): JSX.Element => {

  const { t } = useTranslation();

  const { drawioContent, rangeLineNumberOfMarkdown, isPreview } = props;

  // const { open: openDrawioModal } = useDrawioModalForPage();

  const drawioContainerRef = useRef<HTMLDivElement>(null);

  const globalEmitter: EventEmitter = useMemo(() => (window as CustomWindow).globalEmitter, []);
  const GraphViewer: IGraphViewer = useMemo(() => (window as CustomWindow).GraphViewer, []);

  const editButtonClickHandler = useCallback(() => {
    const { beginLineNumber, endLineNumber } = rangeLineNumberOfMarkdown;
    globalEmitter.emit('launchDrawioModal', beginLineNumber, endLineNumber);
  }, [rangeLineNumberOfMarkdown, globalEmitter]);

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
        GraphViewer.createViewerForElement(div);
      }
    }
  }, [GraphViewer]);

  const renderDrawioWithDebounce = useMemo(() => debounce(200, renderDrawio), [renderDrawio]);

  useEffect(() => {
    if (GraphViewer == null) {
      return;
    }

    renderDrawioWithDebounce();
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
