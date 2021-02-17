import { Breakpoint } from '~/interfaces/breakpoints';


export const addBreakpointListener = (breakpoint: Breakpoint, listener: (this: MediaQueryList, ev: MediaQueryListEvent) => any, invokeOnInit = false): void => {
  document.addEventListener('DOMContentLoaded', () => {
    // get the value of '--breakpoint-*'
    const breakpointPixel = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue(`--breakpoint-${breakpoint}`), 10);

    const mediaQuery = window.matchMedia(`(min-width: ${breakpointPixel}px)`);

    // add event listener
    mediaQuery.addEventListener('change', listener);
  });
};
