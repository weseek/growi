import { Breakpoint } from '../interfaces/breakpoints';

const EVENT_TYPE_CHANGE = 'change';

export const addBreakpointListener = (
    breakpoint: Breakpoint,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any,
): MediaQueryList => {
  // get the value of '--bs-breakpoint-*'
  const breakpointPixel = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue(`--bs-breakpoint-${breakpoint}`), 10);

  const mediaQueryList = window.matchMedia(`(min-width: ${breakpointPixel}px)`);

  // add event listener
  mediaQueryList.addEventListener(EVENT_TYPE_CHANGE, listener);

  return mediaQueryList;
};

export const cleanupBreakpointListener = (
    mediaQueryList: MediaQueryList,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any,
): void => {
  mediaQueryList.removeEventListener(EVENT_TYPE_CHANGE, listener);
};
