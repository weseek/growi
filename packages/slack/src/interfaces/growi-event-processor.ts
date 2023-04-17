import type { WebClient } from '@slack/web-api';

export interface GrowiEventProcessor {
  shouldHandleEvent(eventType: string): boolean;

  processEvent(client: WebClient, event: any): Promise<void>;
}
