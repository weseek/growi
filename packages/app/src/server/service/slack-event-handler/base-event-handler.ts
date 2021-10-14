import { WebClient } from '@slack/web-api';
import {
  GrowiBotEvent,
} from '@growi/slack';

export interface SlackEventHandler {

  shouldHandle(eventType: string): boolean

  handleEvent(client: WebClient, growiBotEvent: GrowiBotEvent): Promise<void>

}
