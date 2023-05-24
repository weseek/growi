import { selectAll, type HastNode, type Element } from 'hast-util-select';
import isAbsolute from 'is-absolute-url';
import { Plugin } from 'unified';

export type IAnchorsSelector = (node: HastNode) => Element[];
export type IHrefResolver = (relativeHref: string, basePath: string) => string;

const defaultAnchorsSelector: IAnchorsSelector = (node) => {
  return selectAll('a[href]', node);
};

const defaultHrefResolver: IHrefResolver = (relativeHref, basePath) => {
  // generate relative pathname
  const baseUrl = new URL(basePath, 'https://example.com');
  const relativeUrl = new URL(relativeHref, baseUrl);

  const { pathname, search, hash } = relativeUrl;
  return `${pathname}${search}${hash}`;
};

const isAnchorLink = (href: string): boolean => {
  return href.toString().length > 0 && href[0] === '#';
};

export type RelativeLinksPluginParams = {
  pagePath?: string,
  anchorsSelector?: IAnchorsSelector,
  hrefResolver?: IHrefResolver,
}

export const relativeLinks: Plugin<[RelativeLinksPluginParams]> = (options = {}) => {
  const anchorsSelector = options.anchorsSelector ?? defaultAnchorsSelector;
  const hrefResolver = options.hrefResolver ?? defaultHrefResolver;

  return (tree) => {
    if (options.pagePath == null) {
      return;
    }

    const pagePath = options.pagePath;
    const anchors = anchorsSelector(tree as HastNode);

    anchors.forEach((anchor) => {
      if (anchor.properties == null) {
        return;
      }

      const href = anchor.properties.href;
      if (href == null || typeof href !== 'string' || isAbsolute(href) || isAnchorLink(href)) {
        return;
      }

      anchor.properties.href = hrefResolver(href, pagePath);
    });
  };
};
