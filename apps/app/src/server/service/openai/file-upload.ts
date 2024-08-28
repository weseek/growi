import { Readable } from 'stream';

import type { IPageHasId } from '@growi/core';
import { toFile } from 'openai';

import { openaiClient } from './client';

type PageToUpload = Omit<IPageHasId, 'revision'> & { revision: { body: string } };

export const fileUpload = async(pages: PageToUpload[]): Promise<void> => {
  const vectorStoreId = process.env.OPENAI_VECTOR_STORE_ID;
  if (vectorStoreId == null) {
    return;
  }

  const filesPromise = pages
    .filter(pages => pages.revision.body.length > 0)
    .map(async(page) => {
      const file = await toFile(Readable.from(page.revision.body), `${page._id}.md`);
      return file;
    });

  const files = await Promise.all(filesPromise);

  await openaiClient.beta.vectorStores.fileBatches.uploadAndPoll(vectorStoreId, { files });
};
