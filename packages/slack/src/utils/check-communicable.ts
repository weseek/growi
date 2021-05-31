import axios, { AxiosError } from 'axios';

import { WebClient } from '@slack/web-api';

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
const testSlackApiServer = async(client: WebClient): Promise<any> => {
  const result = await client.api.test();

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result;
};

const checkSlackScopes = (resultTestSlackApiServer: any) => {
  const slackScopes = resultTestSlackApiServer.response_metadata.scopes;
  const correctScopes = ['commands', 'team:read', 'chat:write'];
  const isPassedScopeCheck = correctScopes.every(e => slackScopes.includes(e));

  if (!isPassedScopeCheck) {
    throw new Error('The scopes is not appropriate. Required scopes is [\'commands\', \'team:read\', \'chat:write\']');
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
 * @param token bot OAuth token
 * @returns
 */
export const testToSlack = async(token:string): Promise<ConnectionStatus> => {
  const client = generateWebClient(token);
  const status: ConnectionStatus = {};

  try {
    // try to connect
    const resultTestSlackApiServer = await testSlackApiServer(client);
    // check scope
    await checkSlackScopes(resultTestSlackApiServer);
    // retrieve workspace name
    status.workspaceName = await retrieveWorkspaceName(client);
  }
  catch (err) {
    status.error = err;
  }

  return status;
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
        const status: ConnectionStatus = await testToSlack(token);

        (await acc).set(token, status);
        return acc;
      },
      // define initial accumulator
      Promise.resolve(new Map<string, ConnectionStatus>()),
    );

  // convert to object
  return Object.fromEntries(await map);
};

export const sendSuccessMessage = async(token:string, channel:string, appSiteUrl:string): Promise<void> => {
  const client = generateWebClient(token);
  await client.chat.postMessage({
    channel,
    text: `Successfully tested with ${appSiteUrl}.`,
  });
};
