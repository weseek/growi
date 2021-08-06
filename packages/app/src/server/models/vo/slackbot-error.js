/**
 * Error class for slackbot service
 */
class SlackbotError extends Error {

  constructor({
    method, to, popupMessage, mainMessage,
  } = {}) {
    super();
    this.method = method;
    this.to = to;
    this.popupMessage = popupMessage;
    this.mainMessage = mainMessage;
  }

  static isSlackbotError(obj) {
    return obj instanceof this;
  }

}

module.exports = SlackbotError;
