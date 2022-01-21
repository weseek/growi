import { apiv3Put } from '~/client/util/apiv3-client';

export const checkAndUpdateImageUrlCached = (useSWRNext) => {
  return (key, fetcher, config) => {
    const swrNext = useSWRNext(key, fetcher, config);
    if (swrNext.data != null) {
      const distinctUserIds = Array.from(new Set([swrNext.data]));
      if (distinctUserIds.length > 0) {
        apiv3Put('/users/update.imageUrlCache', { userIds: distinctUserIds });
      }
    }
    return swrNext;
  };
};
