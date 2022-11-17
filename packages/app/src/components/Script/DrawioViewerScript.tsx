import { useCallback } from 'react';

import { IGraphViewer } from '@growi/remark-drawio-plugin';
import Script from 'next/script';

interface Window {
  GraphViewer: IGraphViewer
}
declare const window: Window;

export const DrawioViewerScript = (): JSX.Element => {
  const loadedHandler = useCallback(() => {
    const { GraphViewer } = window;

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
      src="https://www.draw.io/js/viewer.min.js"
      onLoad={loadedHandler}
    />
  );
};
