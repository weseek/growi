import { customTagUtils } from '@growi/core';

const { OptionParser } = customTagUtils;

export class LsxContext {

  pagePath: string;

  options?: Record<string, string|undefined>;

  constructor(pagePath: string, options: Record<string, string|undefined>) {
    this.pagePath = pagePath;
    this.options = options;
  }

  getOptDepth() {
    if (this.options?.depth == null) {
      return undefined;
    }
    return OptionParser.parseRange(this.options.depth);
  }

}
