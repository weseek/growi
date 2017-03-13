export class LsxContext {

  renderId;
  isCache;
  currentPagePath;
  tagExpression;
  fromPagePath;
  lsxArgs;
  html;

  static fronJson(json) {
    let context = Object.create(LsxContext, JSON.parse(json));
    context.isCache = true;

    return contest;
  }

  generateCacheKey() {
    return `${this.fromPagePath}__${this.lsxArgs}`;
  }
}
