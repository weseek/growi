export class LsxContext {

  renderId;

  currentPagePath;
  tagExpression;
  fromPagePath;
  lsxArgs;

  generateCacheKey() {
    return `${this.fromPagePath}__${this.lsxArgs}`;
  }
}
