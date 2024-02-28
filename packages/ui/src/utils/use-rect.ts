// ref: https://gist.github.com/morajabi/523d7a642d8c0a2f71fcfa0d8b3d2846?permalink_comment_id=4688158#gistcomment-4688158

import { useState, useRef, useEffect } from 'react';

type MutableRefObject<T> = {
  current: T
}

type EventType = 'resize' | 'scroll'

const useEffectInEvent = (
    event: EventType,
    useCapture?: boolean,
    set?: () => void,
) => {
  useEffect(() => {
    if (set) {
      set();
      window.addEventListener(event, set, useCapture);

      return () => window.removeEventListener(event, set, useCapture);
    }
  }, [event, set, useCapture]);
};

export const useRect = <T extends HTMLDivElement | null>(
  event: EventType = 'resize',
): [DOMRect | undefined, MutableRefObject<T | null>, number] => {
  const [rect, setRect] = useState<DOMRect>();

  const reference = useRef<T>(null);

  const [screenHeight, setScreenHeight] = useState(window.innerHeight);

  const set = (): void => {
    setRect(reference.current?.getBoundingClientRect());
  };

  useEffectInEvent(event, true, set);
  const handleResize = () => {
    setScreenHeight(window.innerHeight);
  };

  useEffect(() => {
    window.addEventListener(event, handleResize);
    return () => {
      window.removeEventListener(event, handleResize);
    };
  }, [event]);

  return [rect, reference, screenHeight];
};
