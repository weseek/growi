/**
 * for storing loading context to sessionStorage
 */
export class LsxLoadingContext {

  tagExpression;
  currentPath;
  lsxArgs;

  constructor(tagExpression, currentPath, lsxArgs) {
    this.tagExpression = tagExpression;
    this.currentPath = currentPath;
    this.lsxArgs = lsxArgs;
  }

}
