import { IGraphViewer } from '@growi/remark-drawio-plugin';
import Script from 'next/script';

interface Window {
  GraphViewer: IGraphViewer
}
declare const window: Window;

export const DrawioViewerScript = (): JSX.Element => {
  return (
    <Script
      type="text/javascript" src="https://www.draw.io/js/viewer.min.js" onLoad={() => window.GraphViewer.processElements() }
    />
  );
};
