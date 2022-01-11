import { Middleware, SWRHook } from 'swr';

export const serializeKey: Middleware = (useSWRNext: SWRHook) => {
  return (key, fetcher, config) => {
    const serializedKey = Array.isArray(key) ? JSON.stringify(key) : key;

    if (fetcher == null) {
      return useSWRNext(serializedKey, config);
    }

    return useSWRNext(serializedKey, key => fetcher(...JSON.parse(key)), config);
  };
};
