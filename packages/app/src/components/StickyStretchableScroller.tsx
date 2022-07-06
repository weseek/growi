import React, {
  useEffect, useCallback, ReactNode, useRef, useState, useMemo, RefObject,
} from 'react';

import SimpleBar from 'simplebar-react';
import StickyEvents from 'sticky-events';
import { debounce } from 'throttle-debounce';

import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:cli:StickyStretchableScroller');


export type StickyStretchableScrollerProps = {
  stickyElemSelector: string,
  simplebarRef?: (ref: RefObject<SimpleBar>) => void,
  calcViewHeight?: (scrollElement: HTMLElement) => number,
  children?: ReactNode,
}

/**
 * USAGE:
 *
  const calcViewHeight = useCallback(() => {
    const containerElem = document.querySelector('#sticky-elem');
    const containerTop = containerElem.getBoundingClientRect().top;

    // stretch to the bottom of window
    return window.innerHeight - containerTop;
  });

  return (
    <StickyStretchableScroller
      stickyElemSelector="#sticky-elem"
      calcViewHeight={calcViewHeight}
    >
      <div>
        ...
      </div>
    </StickyStretchableScroller>
  );
 */
export const StickyStretchableScroller = (props: StickyStretchableScrollerProps): JSX.Element => {

  const {
    children, stickyElemSelector, calcViewHeight, simplebarRef: setSimplebarRef,
  } = props;

  const simplebarRef = useRef<SimpleBar>(null);
  const [simplebarMaxHeight, setSimplebarMaxHeight] = useState<number|undefined>();

  /**
   * Reset scrollbar
   */
  const resetScrollbar = useCallback(() => {
    if (simplebarRef.current == null || calcViewHeight == null) {
      return;
    }

    const scrollElement = simplebarRef.current.getScrollElement();
    const newHeight = calcViewHeight(scrollElement);

    logger.debug('Set new height to simplebar', newHeight);

    // set new height
    setSimplebarMaxHeight(newHeight);
    // reculculate
    simplebarRef.current.recalculate();
  }, [calcViewHeight]);

  const resetScrollbarDebounced = useMemo(() => debounce(100, resetScrollbar), [resetScrollbar]);

  // const stickyChangeHandler = useCallback(() => {
  //   logger.debug('StickyEvents.CHANGE detected');
  //   resetScrollbarDebounced();
  // }, [resetScrollbarDebounced]);

  // // setup effect by sticky event
  // useEffect(() => {
  //   // sticky
  //   // See: https://github.com/ryanwalters/sticky-events
  //   const stickyEvents = new StickyEvents({ stickySelector: stickyElemSelector });
  //   stickyEvents.enableEvents();
  //   const { stickySelector } = stickyEvents;
  //   const elem = document.querySelector(stickySelector);
  //   elem.addEventListener(StickyEvents.CHANGE, stickyChangeHandler);

  //   // return clean up handler
  //   return () => {
  //     elem.removeEventListener(StickyEvents.CHANGE, stickyChangeHandler);
  //   };
  // }, [stickyElemSelector, stickyChangeHandler]);

  // setup effect by resizing event
  useEffect(() => {
    const resizeHandler = () => {
      resetScrollbarDebounced();
    };

    window.addEventListener('resize', resizeHandler);

    // return clean up handler
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  }, [resetScrollbarDebounced]);

  // setup effect on init
  useEffect(() => {
    resetScrollbarDebounced();
  }, [resetScrollbarDebounced]);

  // update ref
  useEffect(() => {
    if (setSimplebarRef != null) {
      setSimplebarRef(simplebarRef);
    }
  }, [setSimplebarRef]);

  return (
    <SimpleBar style={{ maxHeight: simplebarMaxHeight }} ref={simplebarRef}>
      { children }
    </SimpleBar>
  );
};
