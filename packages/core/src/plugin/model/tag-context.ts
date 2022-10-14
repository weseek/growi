/**
 * Context class for custom-tag-utils#findTagAndReplace
 */
export class TagContext {

  tagExpression: string | null;

  method: string | null;

  args: any;

  constructor(initArgs: any = {}) {
    this.tagExpression = initArgs.tagExpression || null;
    this.method = initArgs.method || null;
    this.args = initArgs.args || null;
  }

}
