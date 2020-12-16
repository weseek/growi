export class ErrorV3 extends Error {

  message: string;

  code: string;

  stack?: any;

  constructor(message = '', code = '', stack = undefined) {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
    this.stack = stack;
  }

}
