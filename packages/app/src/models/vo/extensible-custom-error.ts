// Custom error object for ExternalAccount login
export class ExtensibleCustomError extends Error {

  args?: any;

  constructor(message = '', args = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.args = args;
  }

}
