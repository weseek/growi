// Any slack command handler should inherit BaseSlackCommandHandler
class BaseSlackCommandHandler {

  /** @type {import('~/server/crowi').default} Crowi instance */
  crowi;

  /** @param {import('~/server/crowi').default} crowi Crowi instance */
  constructor(crowi) {
    this.crowi = crowi;
  }

  /**
   * Handle /commands endpoint
   */
  handleCommand(_growiCommand, client, _body) { throw new Error('Implement this') }

  /**
   * Handle interactions
   */
  handleInteractions(_client, _interactionPayload, _interactionPayloadAccessor, _handlerMethodName) { throw new Error('Implement this') }

}

module.exports = BaseSlackCommandHandler;
