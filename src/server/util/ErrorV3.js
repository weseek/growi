class ErrorV3 extends Error {

  constructor(message = '', code = '') {
    super(); // do not provide message to the super constructor
    this.message = message;
    this.code = code;
  }

}

module.exports = ErrorV3;
