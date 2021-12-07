import { IPage } from '~/interfaces/page';

export const parsePageModel = (page: IPage): string => {
  return JSON.stringify({
    path: page.path,
    creator: page.creator,
  });
};

export const getSnapshotPagePath = (snapshot: string): string => {
  return JSON.parse(snapshot).path;
};
