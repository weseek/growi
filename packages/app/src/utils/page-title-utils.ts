const HOME_PAGE_TITLE = 'HOME';

export const generatePageTitleFromPagePath = (pagePath: string): string => {
  let pageTitle: string;

  switch (pagePath) {
    case '/':
      pageTitle = HOME_PAGE_TITLE;
      break;
    default:
      // /Sandbox → pageTitle is Sandbox
      // /Sandbox/Math → pageTitle is Math
      pageTitle = (pagePath).replace(/^(.)*\//, '');
  }

  return pageTitle;
};
