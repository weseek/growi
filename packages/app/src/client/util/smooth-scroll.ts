const WIKI_HEADER_LINK = 120;

export const smoothScrollIntoView = (element: HTMLElement, offsetTop = 0, scrollElement: HTMLElement | Window = window): void => {
  const targetElement = element || window.document.body;

  // get the distance to the target element top
  const rectTop = targetElement.getBoundingClientRect().top;

  const top = window.pageYOffset + rectTop - offsetTop;

  scrollElement.scrollTo({
    top,
    behavior: 'smooth',
  });
};

/**
 * scroll to the top of the target element
 * by using JQuery slimScroll: http://rocha.la/jQuery-slimScroll
 */
export const jQuerySlimScrollIntoView = (scrollableElement: HTMLElement, scrollTargetElement: HTMLElement, offsetTop = 0): void => {
  const targetTop = scrollTargetElement.getBoundingClientRect().top;

  const scrollTo = targetTop - offsetTop;
  (<any>$(scrollableElement)).slimScroll({ scrollTo });
  /**
   * the following code is a workaround since the scrollbar doesn't move without mouseover event after applying slimscroll
   * https://github.com/rochal/jQuery-slimScroll/issues/287#issuecomment-797090432
   */
  (<any>$(scrollableElement)).trigger('mouseover');
};

export type SmoothScrollEventCallback = (elem: HTMLElement) => void;

export const addSmoothScrollEvent = (elements: HTMLAnchorElement[], callback?: SmoothScrollEventCallback): void => {
  elements.forEach((link) => {
    const href = link.getAttribute('href');

    if (href == null) {
      return;
    }

    link.addEventListener('click', (e) => {
      e.preventDefault();

      // modify location.hash without scroll
      window.history.pushState({}, '', link.href);

      // smooth scroll
      const elemId = href.replace('#', '');
      const targetDom = document.getElementById(elemId);
      if (targetDom != null) {
        smoothScrollIntoView(targetDom, WIKI_HEADER_LINK);

        if (callback != null) {
          callback(targetDom);
        }
      }
    });
  });
};
