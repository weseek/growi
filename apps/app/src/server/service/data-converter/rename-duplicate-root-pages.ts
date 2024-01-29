// see: https://github.com/weseek/growi/issues/8337

import { type IPageHasId } from '@growi/core';
import mongoose from 'mongoose';

import { type PageModel } from '~/server/models/page';

const now = new Date();
const PARENT_PAGE_PATH_AFTER_RENAMING = `/renamed_at_${now.getTime()}`;

export const renameDuplicateRootPages = async(): Promise<void> => {
  const Page = mongoose.model('Page') as PageModel;
  const rootPages = await Page.find({ path: '/' }).sort({ createdAt: 1 }) as Array<IPageHasId>;

  if (rootPages.length <= 1) {
    return;
  }

  // Create parent page
  const rootPage = rootPages[0];
  const descedantCount = rootPages.length - 1;
  const parentPageAfterRenaming = await Page.createEmptyPage(PARENT_PAGE_PATH_AFTER_RENAMING, rootPage, descedantCount);

  // Rename duplicate root pages
  const duplicatedRootPages = rootPages.slice(1);
  const requests = duplicatedRootPages.map((page) => {
    return {
      updateOne: {
        filter: { _id: page._id },
        update: {
          $set: {
            parent: parentPageAfterRenaming,
            path: `${PARENT_PAGE_PATH_AFTER_RENAMING}/${page._id.toString().slice(-10)}`,
          },
        },
      },
    };
  });
  await Page.bulkWrite(requests);
};
