import { Readable } from 'stream';

import { PageGrant } from '@growi/core';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { toFile } from 'openai';

import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';

import OpenaiClient from './openai-client-delegator';

export interface IOpenaiService {
  rebuildVectorStore(): Promise<void>;
}
class OpenaiService implements IOpenaiService {

  private client: OpenaiClient;

  constructor() {
    const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
    if (!aiEnabled) {
      return;
    }
    this.client = new OpenaiClient();
  }

  async rebuildVectorStore() {
    // Delete an existing VectorStoreFile
    // const vectorStoreFileData = await this.client.getVectorStoreFiles();
    // const vectorStoreFiles = vectorStoreFileData?.data;
    // if (vectorStoreFiles != null && vectorStoreFiles.length > 0) {
    //   vectorStoreFiles.forEach(async(vectorStoreFile) => {
    //     await this.client.deleteVectorStoreFiles(vectorStoreFile.id);
    //   });
    // }

    // Create all public pages VectorStoreFile
    const page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
    const allPublicPages = await page.find({ grant: PageGrant.GRANT_PUBLIC }).populate('revision');

    const filesPromise = allPublicPages
      .filter(page => page.revision?.body != null && page.revision.body.length > 0)
      .map(async(page) => {
        const file = await toFile(Readable.from(page.revision.body), `${page._id}.md`);
        return file;
      });

    if (filesPromise.length === 0) {
      return;
    }

    const files = await Promise.all(filesPromise);
    await this.client.uploadAndPoll(files);
  }

}

export const openaiService = new OpenaiService();
