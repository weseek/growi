class Apiv1ErrorHandler extends Error {

  constructor(message = '', code = '') {
    super();

    this.message = message;
    this.code = code;
  }

}

module.exports = Apiv1ErrorHandler;
