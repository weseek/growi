// Any slack command handler should inherit BaseSlackCommandHandler
class BaseSlackCommandHandler {

  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Handle /commands endpoint
   */
  handleCommand(client, body, ...opt) { throw new Error('Implement this') }

  /**
   * Handle /interactions endpoint 'block_actions'
   */
  handleBlockActions(client, payload, handlerMethodName) { throw new Error('Implement this') }

  /**
   * Handle /interactions endpoint 'view_submission'
   */
  handleViewSubmission(client, payload, handlerMethodName) { throw new Error('Implement this') }

}

module.exports = BaseSlackCommandHandler;
