import { apiv3Put } from '~/client/util/apiv3-client';

export const checkAndUpdateImageUrlCached = (useSWRNext) => {
  return (key, fetcher, config) => {
    const swrNext = useSWRNext(key, fetcher, config);
    if (swrNext.data != null) {
      const likerIds = swrNext.data?.likerIds != null ? swrNext.data.likerIds : [];
      const seenUserIds = swrNext.data?.seenUserIds != null ? swrNext.data.seenUserIds : [];
      const distinctUserIds = Array.from(new Set([...likerIds, ...seenUserIds]));

      if (distinctUserIds.length > 0) {
        apiv3Put('/users/update.imageUrlCache', { userIds: distinctUserIds });
      }
    }
    return swrNext;

  };
};
