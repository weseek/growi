const WIKI_HEADER_LINK = 120;

export const smoothScrollIntoView = (element?: HTMLElement, offsetTop = 0, scrollElement: HTMLElement | Window = window): void => {
  const targetElement = element || window.document.body;

  // get the distance to the target element top
  const rectTop = targetElement.getBoundingClientRect().top;

  const top = window.pageYOffset + rectTop - offsetTop;

  scrollElement.scrollTo({
    top,
    behavior: 'smooth',
  });
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
