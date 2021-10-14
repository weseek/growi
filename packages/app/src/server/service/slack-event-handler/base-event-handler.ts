import { WebClient } from '@slack/web-api';
import { GrowiBotEvent } from '@growi/slack';

export interface SlackEventHandler<T> {

  shouldHandle(eventType: string): boolean

  handleEvent(client: WebClient, growiBotEvent: GrowiBotEvent<T>, data: any): Promise<void>

}
