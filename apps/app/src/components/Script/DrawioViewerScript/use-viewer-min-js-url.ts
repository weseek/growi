import urljoin from 'url-join';

import { useRendererConfig } from '~/stores/context';

export const useViewerMinJsUrl = (): string => {
  const { data: rendererConfig } = useRendererConfig();

  const { drawioUri: _drawioUriStr = 'http://localhost' } = rendererConfig ?? {};

  // extract search from URL
  const drawioUri = new URL(_drawioUriStr);
  const pathname = urljoin(drawioUri.pathname, '/js/viewer.min.js');

  return `${drawioUri.origin}${pathname}${drawioUri.search}`;
};
