/**
 * Context class for custom-tag-utils#findTagAndReplace
 */
export class TagContext {

  constructor(initArgs = {}) {
    this.tagExpression = initArgs.tagExpression || null;
    this.method = initArgs.method || null;
    this.args = initArgs.args || null;
  }

}
