/**
 * for storing loading context to sessionStorage
 */
export class LsxLoadingContext {

  currentPagePath;
  tagExpression;
  fromPagePath;
  lsxArgs;

  constructor(obj) {
    this.currentPagePath = obj.currentPagePath;
    this.tagExpression = obj.tagExpression;
    this.fromPagePath = obj.fromPagePath;
    this.lsxArgs = obj.lsxArgs;
  }

}
