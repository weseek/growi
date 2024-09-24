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
    // TODO: https://redmine.weseek.co.jp/issues/154364

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
