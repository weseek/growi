import useSWR, { responseInterface } from 'swr';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useCurrentUser = (initialData?: any): responseInterface<any, any> => {
  return useSWR('static/app/currentUser', { initialData });
};
