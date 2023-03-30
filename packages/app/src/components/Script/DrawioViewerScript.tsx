import { useCallback } from 'react';

import type { IGraphViewerGlobal } from '@growi/remark-drawio';
import Script from 'next/script';

import { useDrawioUri } from '~/stores/context';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var GraphViewer: IGraphViewerGlobal;
}

export const DrawioViewerScript = (): JSX.Element => {
  const { data: drawioUri } = useDrawioUri();

  const loadedHandler = useCallback(() => {
    // disable useResizeSensor and checkVisibleState
    //   for preventing resize event by viewer.min.js
    GraphViewer.useResizeSensor = false;
    GraphViewer.prototype.checkVisibleState = false;

    // Set responsive option.
    // refs: https://github.com/jgraph/drawio/blob/v13.9.1/src/main/webapp/js/diagramly/GraphViewer.js#L89-L95
    // GraphViewer.prototype.responsive = true;

    // Set z-index ($zindex-dropdown + 200) for lightbox.
    // 'lightbox' is like a modal dialog that appears when click on a drawio diagram.
    // z-index refs: https://github.com/twbs/bootstrap/blob/v4.6.2/scss/_variables.scss#L681
    GraphViewer.prototype.lightboxZIndex = 1200;
    GraphViewer.prototype.toolbarZIndex = 1200;

    GraphViewer.processElements();
  }, []);

  return (
    <Script
      type="text/javascript"
      src={(new URL('/js/viewer.min.js', drawioUri)).toString()}
      onLoad={loadedHandler}
    />
  );
};
