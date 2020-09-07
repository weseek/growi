/**
 * The interface to handle server-to-server message
 */
interface S2sMessageHandlable {

  shouldHandleS2sMessage(s2sMessage): boolean;

  handleS2sMessage(s2sMessage): Promise<void>;

}

export default S2sMessagingHandlable;
