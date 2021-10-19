import { WebClient } from '@slack/web-api';
import { GrowiBotEvent } from '@growi/slack';

import { EventActionsPermission } from '../../interfaces/slack-integration/events';

export interface SlackEventHandler<T> {

  shouldHandle(eventType: string, permission: EventActionsPermission, channel?: string): boolean

  handleEvent(client: WebClient, growiBotEvent: GrowiBotEvent<T>, data?: any): Promise<void>

}
