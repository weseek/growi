// TODO: make interface with TS

/**
 * The interface to handle server-to-server message
 */
class S2sMessageHandlable {

  shouldHandleS2sMessage(s2sMessage) {
    throw new Error('implement this');
  }

  async handleS2sMessage(s2sMessage) {
    throw new Error('implement this');
  }

}

module.exports = S2sMessageHandlable;
