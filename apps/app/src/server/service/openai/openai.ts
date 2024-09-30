import { Readable } from 'stream';

import { PageGrant, isPopulated } from '@growi/core';
import type { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import { toFile } from 'openai';
import type { FileLike } from 'openai/uploads.mjs';

import { OpenaiServiceTypes } from '~/interfaces/ai';
import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import loggerFactory from '~/utils/logger';

import { getClient } from './client-delegator';

const logger = loggerFactory('growi:service:openai');

const createFileForVectorStore = async(pageId: Types.ObjectId, body: string): Promise<FileLike> => {
  return toFile(Readable.from(body), `${pageId}.md`);
};

export interface IOpenaiService {
  createVectorStoreFile(pages: PageDocument[]): Promise<void>;
  rebuildVectorStoreAll(): Promise<void>;
  rebuildVectorStore(page: PageDocument): Promise<void>;
}
class OpenaiService implements IOpenaiService {

  private get client() {
    const openaiServiceType = configManager.getConfig('crowi', 'app:openaiServiceType');
    return getClient({ openaiServiceType });
  }

  async createVectorStoreFile(pages: PageDocument[]): Promise<void> {
    const filesPromise: Promise<FileLike>[] = [];
    pages.forEach(async(page) => {
      if (page._id != null && page.grant === PageGrant.GRANT_PUBLIC && page.revision != null) {
        if (isPopulated(page.revision) && page.revision.body.length > 0) {
          filesPromise.push(createFileForVectorStore(page._id, page.revision.body));
        }

        const pagePopulatedToShowRevision = await page.populateDataToShowRevision();
        if (pagePopulatedToShowRevision.revision != null && pagePopulatedToShowRevision.revision.body.length > 0) {
          filesPromise.push(createFileForVectorStore(page._id, pagePopulatedToShowRevision.revision.body));
        }
      }
    });

    if (filesPromise.length === 0) {
      return;
    }

    const files = await Promise.all(filesPromise);

    const res = await this.client.uploadAndPoll(files);
    logger.debug('create vector store file: ', res);
  }

  async rebuildVectorStoreAll() {
    // TODO: https://redmine.weseek.co.jp/issues/154364

    // Create all public pages VectorStoreFile
    const page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
    const allPublicPages = await page.find({ grant: PageGrant.GRANT_PUBLIC }).populate('revision') as PageDocument[];

    await this.createVectorStoreFile(allPublicPages);
  }

  async rebuildVectorStore(page: PageDocument) {

    // delete vector store file
    const files = await this.client.getFileList();
    files.data.forEach(async(file) => {
      if (file.filename === `${page._id}.md`) {
        const res = await this.client.deleteFile(file.id);
        logger.debug('delete vector store file: ', res);
      }
    });

    await this.createVectorStoreFile([page]);
  }

}

let instance: OpenaiService;
export const getOpenaiService = (): IOpenaiService | undefined => {
  if (instance != null) {
    return instance;
  }

  const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
  const openaiServiceType = configManager.getConfig('crowi', 'app:openaiServiceType');
  if (aiEnabled && openaiServiceType != null && OpenaiServiceTypes.includes(openaiServiceType)) {
    instance = new OpenaiService();
    return instance;
  }

  return;
};
