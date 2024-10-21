import assert from 'node:assert';
import { Readable, Transform } from 'stream';

import { PageGrant, isPopulated } from '@growi/core';
import type { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import OpenAI, { toFile } from 'openai';

import ThreadRelationModel from '~/features/openai/server/models/thread-relation';
import VectorStoreModel, { VectorStoreScopeType, type VectorStoreDocument } from '~/features/openai/server/models/vector-store';
import VectorStoreFileRelationModel, {
  type VectorStoreFileRelation,
  prepareVectorStoreFileRelations,
} from '~/features/openai/server/models/vector-store-file-relation';
import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';

import { OpenaiServiceTypes } from '../../interfaces/ai';


import { getClient } from './client-delegator';

const BATCH_SIZE = 100;

const logger = loggerFactory('growi:service:openai');

let isVectorStoreForPublicScopeExist = false;

export interface IOpenaiService {
  getOrCreateThread(userId: string, vectorStoreId?: string, threadId?: string): Promise<OpenAI.Beta.Threads.Thread | undefined>;
  getOrCreateVectorStoreForPublicScope(): Promise<VectorStoreDocument>;
  deleteExpiredThreads(limit: number): Promise<void>;
  createVectorStoreFile(pages: PageDocument[]): Promise<void>;
  deleteVectorStoreFile(pageId: Types.ObjectId): Promise<void>;
  rebuildVectorStoreAll(): Promise<void>;
  rebuildVectorStore(page: HydratedDocument<PageDocument>): Promise<void>;
}
class OpenaiService implements IOpenaiService {

  private get client() {
    const openaiServiceType = configManager.getConfig('crowi', 'openai:serviceType');
    return getClient({ openaiServiceType });
  }

  public async getOrCreateThread(userId: string, vectorStoreId?: string, threadId?: string): Promise<OpenAI.Beta.Threads.Thread> {
    if (vectorStoreId != null && threadId == null) {
      try {
        const thread = await this.client.createThread(vectorStoreId);
        await ThreadRelationModel.create({ userId, threadId: thread.id });
        return thread;
      }
      catch (err) {
        throw new Error(err);
      }
    }

    const threadRelation = await ThreadRelationModel.findOne({ threadId });
    if (threadRelation == null) {
      throw new Error('ThreadRelation document is not exists');
    }

    // Check if a thread entity exists
    // If the thread entity does not exist, the thread-relation document is deleted
    try {
      const thread = await this.client.retrieveThread(threadRelation.threadId);

      // Update expiration date if thread entity exists
      await threadRelation.updateThreadExpiration();

      return thread;
    }
    catch (err) {
      if (err instanceof OpenAI.APIError) {
        if (err.status === 404) {
          await threadRelation.remove();
        }
      }
      throw new Error(err);
    }
  }

  public async deleteExpiredThreads(limit: number): Promise<void> {
    const expiredThreadRelations = await ThreadRelationModel.getExpiredThreadRelations(limit);
    if (expiredThreadRelations == null) {
      return;
    }

    const deletedThreadIds: string[] = [];
    for await (const expiredThreadRelation of expiredThreadRelations) {
      try {
        const deleteThreadResponse = await this.client.deleteThread(expiredThreadRelation.threadId);
        logger.debug('Delete thread', deleteThreadResponse);
        deletedThreadIds.push(expiredThreadRelation.threadId);
      }
      catch (err) {
        logger.error(err);
      }
    }

    await ThreadRelationModel.deleteMany({ threadId: { $in: deletedThreadIds } });
  }

  public async getOrCreateVectorStoreForPublicScope(): Promise<VectorStoreDocument> {
    const vectorStoreDocument = await VectorStoreModel.findOne({ scorpeType: VectorStoreScopeType.PUBLIC });

    if (vectorStoreDocument != null && isVectorStoreForPublicScopeExist) {
      return vectorStoreDocument;
    }

    if (vectorStoreDocument != null && !isVectorStoreForPublicScopeExist) {
      try {
        await this.client.retrieveVectorStore(vectorStoreDocument.vectorStoreId);
        isVectorStoreForPublicScopeExist = true;
        return vectorStoreDocument;
      }
      catch (err) {
        if (err instanceof OpenAI.APIError) {
          if (err.status === 404) {
            vectorStoreDocument.remove();
          }
        }
        logger.error(err);
        throw new Error(err);
      }
    }

    const newVectorStore = await this.client.createVectorStore(VectorStoreScopeType.PUBLIC);
    const newVectorStoreDocument = await VectorStoreModel.create({
      vectorStoreId: newVectorStore.id,
      scorpeType: VectorStoreScopeType.PUBLIC,
    });

    isVectorStoreForPublicScopeExist = true;

    return newVectorStoreDocument;
  }

  private async uploadFile(pageId: Types.ObjectId, body: string): Promise<OpenAI.Files.FileObject> {
    const file = await toFile(Readable.from(body), `${pageId}.md`);
    const uploadedFile = await this.client.uploadFile(file);
    return uploadedFile;
  }

  async createVectorStoreFile(pages: Array<HydratedDocument<PageDocument>>): Promise<void> {
    const vectorStoreFileRelationsMap: Map<string, VectorStoreFileRelation> = new Map();
    const processUploadFile = async(page: PageDocument) => {
      if (page._id != null && page.grant === PageGrant.GRANT_PUBLIC && page.revision != null) {
        if (isPopulated(page.revision) && page.revision.body.length > 0) {
          const uploadedFile = await this.uploadFile(page._id, page.revision.body);
          prepareVectorStoreFileRelations(page._id, uploadedFile.id, vectorStoreFileRelationsMap);
          return;
        }

        const pagePopulatedToShowRevision = await page.populateDataToShowRevision();
        if (pagePopulatedToShowRevision.revision != null && pagePopulatedToShowRevision.revision.body.length > 0) {
          const uploadedFile = await this.uploadFile(page._id, pagePopulatedToShowRevision.revision.body);
          prepareVectorStoreFileRelations(page._id, uploadedFile.id, vectorStoreFileRelationsMap);
        }
      }
    };

    // Start workers to process results
    const workers = pages.map(processUploadFile);

    // Wait for all processing to complete.
    assert(workers.length <= BATCH_SIZE, 'workers.length must be less than or equal to BATCH_SIZE');
    const fileUploadResult = await Promise.allSettled(workers);
    fileUploadResult.forEach((result) => {
      if (result.status === 'rejected') {
        logger.error(result.reason);
      }
    });

    const vectorStoreFileRelations = Array.from(vectorStoreFileRelationsMap.values());
    const uploadedFileIds = vectorStoreFileRelations.map(data => data.fileIds).flat();

    if (uploadedFileIds.length === 0) {
      return;
    }

    try {
      // Save vector store file relation
      await VectorStoreFileRelationModel.upsertVectorStoreFileRelations(vectorStoreFileRelations);

      // Create vector store file
      const vectorStore = await this.getOrCreateVectorStoreForPublicScope();
      const createVectorStoreFileBatchResponse = await this.client.createVectorStoreFileBatch(vectorStore.vectorStoreId, uploadedFileIds);
      logger.debug('Create vector store file', createVectorStoreFileBatchResponse);
    }
    catch (err) {
      logger.error(err);

      // Delete all uploaded files if createVectorStoreFileBatch fails
      const pageIds = pages.map(page => page._id);
      for await (const pageId of pageIds) {
        await this.deleteVectorStoreFile(pageId);
      }
    }

  }

  async deleteVectorStoreFile(pageId: Types.ObjectId): Promise<void> {
    // Delete vector store file and delete vector store file relation
    const vectorStoreFileRelation = await VectorStoreFileRelationModel.findOne({ pageId });
    if (vectorStoreFileRelation == null) {
      return;
    }

    const deletedFileIds: string[] = [];
    for await (const fileId of vectorStoreFileRelation.fileIds) {
      try {
        const deleteFileResponse = await this.client.deleteFile(fileId);
        logger.debug('Delete vector store file', deleteFileResponse);
        deletedFileIds.push(fileId);
      }
      catch (err) {
        logger.error(err);
      }
    }

    const undeletedFileIds = vectorStoreFileRelation.fileIds.filter(fileId => !deletedFileIds.includes(fileId));

    if (undeletedFileIds.length === 0) {
      await vectorStoreFileRelation.remove();
      return;
    }

    vectorStoreFileRelation.fileIds = undeletedFileIds;
    await vectorStoreFileRelation.save();
  }

  async rebuildVectorStoreAll() {
    // TODO: https://redmine.weseek.co.jp/issues/154364

    // Create all public pages VectorStoreFile
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
    const pagesStream = Page.find({ grant: PageGrant.GRANT_PUBLIC }).populate('revision').cursor({ batch_size: BATCH_SIZE });
    const batchStrem = createBatchStream(BATCH_SIZE);

    const createVectorStoreFile = this.createVectorStoreFile.bind(this);
    const createVectorStoreFileStream = new Transform({
      objectMode: true,
      async transform(chunk: HydratedDocument<PageDocument>[], encoding, callback) {
        await createVectorStoreFile(chunk);
        this.push(chunk);
        callback();
      },
    });

    pagesStream
      .pipe(batchStrem)
      .pipe(createVectorStoreFileStream);
  }

  async rebuildVectorStore(page: HydratedDocument<PageDocument>) {
    await this.deleteVectorStoreFile(page._id);
    await this.createVectorStoreFile([page]);
  }

}

let instance: OpenaiService;
export const getOpenaiService = (): IOpenaiService | undefined => {
  if (instance != null) {
    return instance;
  }

  const aiEnabled = configManager.getConfig('crowi', 'app:aiEnabled');
  const openaiServiceType = configManager.getConfig('crowi', 'openai:serviceType');
  if (aiEnabled && openaiServiceType != null && OpenaiServiceTypes.includes(openaiServiceType)) {
    instance = new OpenaiService();
    return instance;
  }

  return;
};
