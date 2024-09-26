import { Readable } from 'stream';

import { PageGrant, isPopulated } from '@growi/core';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import { toFile } from 'openai';

import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { getClient } from './client-delegator';

const logger = loggerFactory('growi:service:openai');

export interface IOpenaiService {
  rebuildVectorStoreAll(): Promise<void>;
  rebuildVectorStore(page: PageDocument): Promise<void>;
}
class OpenaiService implements IOpenaiService {

  constructor() {
    const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
    if (!aiEnabled) {
      return;
    }
  }

  private get client() {
    const openaiServiceType = configManager.getConfig('crowi', 'app:openaiServiceType');
    return getClient({ openaiServiceType });
  }

  async rebuildVectorStoreAll() {
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

  async rebuildVectorStore(page: PageDocument) {

    // delete vector store file
    const files = await this.client.getFileList();
    files.data.forEach(async(file) => {
      if (file.filename === `${page._id}.md`) {
        const res = await this.client.deleteFile(file.id);
        logger.debug('delete vector store: ', res);
      }
    });

    // create vector store file
    if (page.grant === PageGrant.GRANT_PUBLIC && page.revision != null && isPopulated(page.revision)) {
      const file = await toFile(Readable.from(page.revision.body), `${page._id}.md`);
      const res = await this.client.uploadAndPoll([file]);
      logger.debug('create vector store: ', res);
    }
  }

}

export const openaiService = new OpenaiService();
