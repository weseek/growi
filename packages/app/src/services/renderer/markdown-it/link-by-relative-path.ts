import path from 'path';

// https://regex101.com/r/vV8LUe/1
const PATTERN_RELATIVE_PATH = new RegExp(/^(\.{1,2})(\/.*)?$/);

export default class LinkerByRelativePathConfigurer {

  pagePath: string;

  constructor(pagePath: string) {
    this.pagePath = pagePath;
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  configure(md): void {
    const pagePath = this.pagePath;

    // Remember old renderer, if overridden, or proxy to default renderer
    const defaultRender = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.link_open = function(tokens, idx, options, env, self) {
      if (tokens[idx] == null || (typeof tokens[idx].attrIndex !== 'function')) {
        return defaultRender(tokens, idx, options, env, self);
      }

      // get href
      const hrefIndex = tokens[idx].attrIndex('href');

      if (hrefIndex != null && hrefIndex >= 0) {
        const href: string = tokens[idx].attrs[hrefIndex][1];
        const currentPath: string | null = pagePath;

        // resolve relative path and replace
        if (PATTERN_RELATIVE_PATH.test(href) && currentPath != null) {
          const newHref = path.resolve(path.dirname(currentPath), href);
          tokens[idx].attrs[hrefIndex][1] = newHref;
        }
      }

      // pass token to default renderer.
      return defaultRender(tokens, idx, options, env, self);
    };

  }

}
