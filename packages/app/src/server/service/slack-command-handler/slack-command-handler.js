// Any slack command handler should inherit BaseSlackCommandHandler
class BaseSlackCommandHandler {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Handle /commands endpoint
   */
  handleCommand(client, body, ...opt) { throw new Error('Implement this') }

}

module.exports = BaseSlackCommandHandler;
