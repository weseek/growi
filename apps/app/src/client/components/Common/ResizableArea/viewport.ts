// Excludes the vertical scrollbar, which is where a right-anchored fixed
// element actually ends. undefined when there is no DOM (SSR).
export const getViewportWidth = (): number | undefined =>
  typeof document === 'undefined'
    ? undefined
    : document.documentElement.clientWidth;
