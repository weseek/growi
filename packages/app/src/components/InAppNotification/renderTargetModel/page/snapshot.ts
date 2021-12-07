import { IPage } from '~/interfaces/page';

export const createSnapshot = (page: IPage): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
  });
};
