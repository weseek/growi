import axios, { AxiosError } from 'axios';

export const checkCommunicableToApiServer = async(serverUri = 'https://slack.com/api/'): Promise<void|AxiosError> => {
  try {
    await axios.get(serverUri, { maxRedirects: 0 });
  }
  catch (err) {
    return err as AxiosError;
  }
};
