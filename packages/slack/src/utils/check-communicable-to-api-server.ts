import axios, { AxiosError } from 'axios';

/**
 * Check whether the HTML server responds or not.
 *
 * @param serverUri Server URI to connect
 * @returns AxiosError when error is occured
 */
export const checkCommunicableToApiServer = async(serverUri = 'https://slack.com/api/'): Promise<void|AxiosError> => {
  try {
    await axios.get(serverUri, { maxRedirects: 0, timeout: 3000 });
  }
  catch (err) {
    return err as AxiosError;
  }
};
