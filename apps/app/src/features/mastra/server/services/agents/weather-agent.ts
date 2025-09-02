import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';

import { weatherTool } from '../tools/weather-tool';

export const weatherAgent = new Agent({
  name: 'Weather Agent',
  instructions: `
      You are a helpful weather assistant that provides accurate weather information.

      Your primary function is to help users get weather details for specific locations. When responding:
      - Always ask for a location if none is provided
      - If the location name isn’t in English, please translate it
      - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
      - Include relevant details like humidity, wind conditions, and precipitation
      - Keep responses concise but informative

      Use the weatherTool to fetch current weather data.
`,
  model: openai('gpt-4o-mini'),
  tools: { weatherTool },
});

const result = await generateText({
  model: openai.responses('gpt-5'),
  prompt: 'What does the document say about user authentication?',
  tools: {
    file_search: openai.tools.fileSearch({
      // optional configuration:
      vectorStoreIds: ['vs_123', 'vs_456'],
      maxNumResults: 10,
      ranking: {
        ranker: 'auto',
      },
      filters: {
        type: 'and',
        filters: [
          { key: 'author', type: 'eq', value: 'John Doe' },
          { key: 'date', type: 'gte', value: '2023-01-01' },
        ],
      },
    }),
  },
  // Force file search tool:
  toolChoice: { type: 'tool', toolName: 'file_search' },
});
