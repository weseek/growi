/**
 * Server-to-server message VO
 */
export default class S2sMessage {

  eventName: string;

  publisherUid: number;

  constructor(eventName: string, body = {}) {
    this.eventName = eventName;
    this.publisherUid = 0;

    for (const [key, value] of Object.entries(body)) {
      this[key] = value;
    }
  }

  setPublisherUid(uid: number): void {
    this.publisherUid = uid;
  }

  static parse(messageString: string): S2sMessage {
    const body = JSON.parse(messageString);

    if (body.eventName == null) {
      throw new Error('message body must contain \'eventName\'');
    }

    return new S2sMessage(body.eventName, body);
  }

}
