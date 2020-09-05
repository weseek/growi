import loggerFactory from '~/utils/logger';

import S2sMessage from '~/server/models/vo/s2s-message';

import S2sMessageHandlable from './handlable';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const logger = loggerFactory('growi:service:s2s-messaging:base');

export abstract class S2sMessagingService {

  uid: number;

  uri: string;

  handlableList: S2sMessageHandlable[];

  constructor(uri: string) {
    this.uid = Math.floor(Math.random() * 100000);
    this.uri = uri;

    if (uri == null) {
      throw new Error('uri must be set');
    }

    this.handlableList = [];
  }

  abstract shouldResubscribe(): boolean;

  abstract subscribe(forceReconnect: boolean): void;

  /**
   * Publish message
   * @param s2sMessage
   */
  async publish(s2sMessage: S2sMessage): Promise<void> {
    s2sMessage.setPublisherUid(this.uid);
  }

  /**
   * Add message handler
   * @param handlable
   */
  addMessageHandler(handlable: S2sMessageHandlable): void {
    this.handlableList.push(handlable);
  }

  /**
   * Remove message handler
   * @param handlable
   */
  removeMessageHandler(handlable: S2sMessageHandlable): void {
    this.handlableList = this.handlableList.filter(h => h !== handlable);
  }

}
