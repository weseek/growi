import { Mastra } from '@mastra/core/mastra';
import { weatherAgent } from './agents/weather-agent';

export const mastra = new Mastra({
  agents: { weatherAgent },
});
