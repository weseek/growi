import { generateWebClient } from './webclient-factory';

/**
 * Test Slack API with specified token
 * @param token Bot OAuth token
 */
export const testSlackApiServer = async(token: string): Promise<void> => {
  const client = generateWebClient(token);
  const result = await client.api.test();

  if (!result.ok) {
    throw new Error(result.error);
  }
};
