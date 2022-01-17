const DEFAULT_IMAGE_URL = '/images/icons/user.svg';

export const isUserImageGravatar = (userImageUrlCached: string): boolean => {
  return /^https:\/\/gravatar\.com\/avatar\/.+/.test(userImageUrlCached);
};


export const isUserImageAttachment = (userImageUrlCached: string): boolean => {
  return /^\/attachment\/.+/.test(userImageUrlCached);
};

export const isUserImageDefault = (userImageUrlCached: string): boolean => {
  return userImageUrlCached === DEFAULT_IMAGE_URL;
};
