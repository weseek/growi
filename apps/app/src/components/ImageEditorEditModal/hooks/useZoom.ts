import { useMemo, useState } from 'react';

export const useZoom = () => {
  const [zoom, setZoom] = useState(0.7);

  const maximum = 2.0;

  const minimum = 0.2;

  const zoomIn = () => {
    setZoom(Math.min(maximum, zoom + 0.1));
  };

  const zoomOut = () => {
    setZoom(Math.max(minimum, zoom - 0.1));
  };

  const canZoomIn = useMemo(() => zoom < maximum, [zoom]);

  const canZoomOut = useMemo(() => zoom > minimum, [zoom]);

  return {
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
    canZoomIn,
    canZoomOut,
  };
};
