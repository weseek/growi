export class ErrorV3 extends Error {

  code: string;

  args?: any;

  constructor(message = '', code = '', stack = undefined, args = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
    this.stack = stack;
    this.args = args;
  }

}
