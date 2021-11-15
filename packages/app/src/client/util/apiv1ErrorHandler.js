class Apiv1ErrorHandler extends Error {

  constructor(message = '', code = '', data = '') {
    super();

    this.message = message;
    this.code = code;
    this.data = data;
  }

}

module.exports = Apiv1ErrorHandler;
