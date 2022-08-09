import { selectAll, HastNode } from 'hast-util-select';
import isAbsolute from 'is-absolute-url';
import { Plugin } from 'unified';

type RelativeLinksPluginParams = {
  pagePath?: string,
}

export const relativeLinks: Plugin<[RelativeLinksPluginParams]> = (options = {}) => {
  return (tree) => {
    if (options.pagePath == null) {
      return;
    }

    const pagePath = options.pagePath;
    const anchors = selectAll('a[href]', tree as HastNode);

    anchors.forEach((anchor) => {
      if (anchor.properties == null) {
        return;
      }

      const href = anchor.properties.href;
      if (href == null || typeof href !== 'string' || isAbsolute(href)) {
        return;
      }

      // generate relative pathname
      const baseUrl = new URL(pagePath, 'https://example.com');
      const relativeUrl = new URL(href, baseUrl);

      anchor.properties.href = relativeUrl.pathname;
    });
  };
};
