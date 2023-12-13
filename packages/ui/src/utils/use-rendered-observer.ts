import {
  useState, type RefObject, useEffect, useMemo,
} from 'react';

import { debounce } from 'throttle-debounce';


type OnRendered = (records: MutationRecord[]) => void;
type Opts = MutationObserverInit & {
  mutationObserverOpts?: MutationObserverInit,
  delay?: number,
  onInit?: () => void,
  onRendered?: OnRendered,
}

const defaultOpts = {
  mutationObserverOpts: {
    childList: true,
    subtree: true,
  },
  delay: 500,
};

type RenderedObserver = {
  isRendering: boolean | undefined,
}

export const useRenderedObserver = <T extends Element>(ref: RefObject<T>, opts?: Opts): RenderedObserver => {

  const [isRendering, setRendering] = useState<boolean>();

  const delay = opts?.delay ?? defaultOpts.delay;
  const mutationObserverOpts = opts?.mutationObserverOpts ?? defaultOpts.mutationObserverOpts;

  const onRenderedDebounced = useMemo(() => debounce<OnRendered>(
    delay,
    (records) => {
      setRendering(false);
      opts?.onRendered?.(records);
    },
  ), [delay, opts]);

  useEffect(() => {
    const element = ref.current;
    if (element == null) return;

    const observer = new MutationObserver((records) => {
      setRendering(true);
      onRenderedDebounced(records);
    });
    observer.observe(element, mutationObserverOpts);

    // init with delay
    setTimeout(() => {
      setRendering(false);
      opts?.onInit?.();
    }, delay);

    // no cleanup function -- 2023.07.31 Yuki Takei
    // see: https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver/observe
    // > You can call observe() multiple times on the same MutationObserver
    // > to watch for changes to different parts of the DOM tree and/or different types of changes.
  }, [onRenderedDebounced, mutationObserverOpts, ref, opts, delay]);

  return {
    isRendering,
  };
};
