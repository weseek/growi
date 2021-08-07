/**
 * Context class for custom-tag-utils#findTagAndReplace
 */
class TagContext {

  constructor(initArgs = {}) {
    this.tagExpression = initArgs.tagExpression || null;
    this.method = initArgs.method || null;
    this.args = initArgs.args || null;
  }

}

module.exports = TagContext;
