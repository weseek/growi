import { RefObject, useState, useEffect } from 'react';

export interface WindowSize {
  width: number | undefined;
  height: number | undefined;
}

export function useResizer({
  width,
  height,
  ref,
  responsive,
  aspectRatio,
}: {
  width: WindowSize['width'];
  height: WindowSize['height'];
  ref: RefObject<HTMLElement>;
  responsive: boolean;
  aspectRatio: number;
}): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width,
    height,
  });

  useEffect(() => {
    function handleResize() {
      const container = ref.current;

      const containerWidth = container.offsetWidth;
      console.log(responsive ? containerWidth * aspectRatio : height);

      setWindowSize({
        width: containerWidth,
        height: responsive ? containerWidth * aspectRatio : height,
      });
    }

    window.addEventListener('resize', handleResize);

    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}
