import { Readable } from 'stream';

import type { IPageHasId } from '@growi/core';
import { toFile } from 'openai';

import { configManager } from '~/server/service/config-manager';

import { openaiClient } from './client';

type PageToUpload = Omit<IPageHasId, 'revision'> & { revision: { body: string } };

export const fileUpload = async(pages: PageToUpload[]): Promise<void> => {
  const vectorStoreId = configManager.getConfig('crowi', 'app:openaiVectorStoreId');
  if (vectorStoreId == null) {
    return;
  }

  const filesPromise = pages
    .filter(pages => pages.revision.body.length > 0)
    .map(async(page) => {
      const file = await toFile(Readable.from(page.revision.body), `${page._id}.md`);
      return file;
    });

  if (filesPromise.length === 0) {
    return;
  }

  const files = await Promise.all(filesPromise);

  await openaiClient.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, { files });
};
