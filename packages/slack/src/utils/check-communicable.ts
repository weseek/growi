import axios, { AxiosError } from 'axios';

import { WebClient, WebAPICallResult } from '@slack/web-api';

import { generateWebClient } from './webclient-factory';
import { ConnectionStatus } from '../interfaces/connection-status';

/**
 * Check whether the HTTP server responds or not.
 *
 * @param serverUri Server URI to connect
 * @returns AxiosError when error is occured
 */
export const connectToHttpServer = async(serverUri: string): Promise<void|AxiosError> => {
  try {
    await axios.get(serverUri, { maxRedirects: 0, timeout: 3000 });
  }
  catch (err) {
    return err as AxiosError;
  }
};

/**
 * Check whether the Slack API server responds or not.
 *
 * @returns AxiosError when error is occured
 */
export const connectToSlackApiServer = async(): Promise<void|AxiosError> => {
  return connectToHttpServer('https://slack.com/api/');
};

/**
 * Test Slack API
 * @param client
 */
const testSlackApiServer = async(client: WebClient): Promise<void> => {
  const result = await client.api.test();

  if (!result.ok) {
    throw new Error(result.error);
  }
};

/**
 * Retrieve Slack workspace name
 * @param client
 */
const retrieveWorkspaceName = async(client: WebClient): Promise<string> => {
  const result = await client.team.info();

  if (!result.ok) {
    throw new Error(result.error);
  }

  return (result as any).team?.name;
};

/**
 * Get token string to ConnectionStatus map
 * @param tokens Array of bot OAuth token
 * @returns
 */
export const getConnectionStatuses = async(tokens: string[]): Promise<{[key: string]: ConnectionStatus}> => {
  const map = tokens
    .reduce<Promise<Map<string, ConnectionStatus>>>(
      async(acc, token) => {
        const client = generateWebClient(token);

        const status: ConnectionStatus = {};
        try {
          // try to connect
          await testSlackApiServer(client);
          // retrieve workspace name
          status.workspaceName = await retrieveWorkspaceName(client);
        }
        catch (err) {
          status.error = err;
        }

        (await acc).set(token, status);

        return acc;

      },
      // define initial accumulator
      Promise.resolve(new Map<string, ConnectionStatus>()),
    );

  // convert to object
  return Object.fromEntries(await map);
};

/**
* Test Slack Auth
* @param client
*/
const testSlackAuth = async(client: WebClient): Promise<WebAPICallResult> => {
  const result = await client.auth.test();
  if (!result.ok) {
    throw new Error(result.error);
  }
  return result;
};

/**
* Post Message to Slack
* @param client
* @param channel channel name
* @param text message to send to Slack channel
*/
const postMessage = async(client: WebClient, channel: string, text: string): Promise<WebAPICallResult> => {
  const result = await client.chat.postMessage({
    channel: `#${channel}`,
    text,
  });
  if (!result.ok) {
    throw new Error(result.error);
  };
  return result;
}

/**
 * Test Slack Bot Connection
 * @param token bot OAuth token
 * @param channel channel name
 * @returns
 */
 export const relationTestToSlack = async(token:string): Promise<void> => {
  const client = generateWebClient(token);
  await testSlackApiServer(client);
};

/**
 * Test Slack Bot Connection and Send Test Message
 * @param token bot OAuth token
 * @param channel channel name
 * @returns
 */
export const pingSlack =
  async(token: string, channel: string): Promise<{testSlackAuthResponse: WebAPICallResult, postMessageResponse: WebAPICallResult}> => {
    const client = generateWebClient(token);
    const text = 'Your test was successful!';
    const testSlackAuthResponse = await testSlackAuth(client);
    const postMessageResponse = await postMessage(client, channel, text);
    return { testSlackAuthResponse, postMessageResponse };
  };
