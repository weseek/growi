import { customTagUtils } from '@growi/core';

const { OptionParser } = customTagUtils;

export class LsxContext {

  pagePath: string;

  options?: Record<string, string|undefined>;

  constructor(pagePath: string, options: Record<string, string|undefined>) {
    this.pagePath = pagePath;

    // remove undefined keys
    Object.keys(options).forEach(key => options[key] === undefined && delete options[key]);

    this.options = options;
  }

  getOptDepth() {
    if (this.options?.depth == null) {
      return undefined;
    }
    return OptionParser.parseRange(this.options.depth);
  }

  /**
   * for printing errors
   * @returns
   */
  toString(): string {
    const attributeStrs = [`prefix=${this.pagePath}`];
    if (this.options != null) {
      attributeStrs.push(
        ...Object.entries(this.options).map(([key, val]) => `${key}=${val || 'true'}`),
      );
    }

    return `$lsx(${attributeStrs.join(', ')})`;
  }

}
