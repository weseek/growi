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
 * @param token A bot OAuth token
 * @returns
 */
export const testSlackAuth = async(token: string): Promise<WebAPICallResult|undefined> => {
  const client = generateWebClient(token);
  const result = await client.auth.test();
  console.log(result);

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result as any;
};
