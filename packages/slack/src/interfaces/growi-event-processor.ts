import { WebClient } from '@slack/web-api';

export interface GrowiEventProcessor {
  shouldHandleEvent(eventType: string): boolean;

  processEvent(client: WebClient, event: any, tokenPtoG?: string): Promise<void>;
}
