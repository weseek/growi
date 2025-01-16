import assert from 'node:assert';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import { PageGrant, isPopulated } from '@growi/core';
import { addTrailingSlash, normalizePath } from '@growi/core/dist/utils/path-utils';
import escapeStringRegexp from 'escape-string-regexp';
import type { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import type OpenAI from 'openai';
import { toFile } from 'openai';

import ThreadRelationModel from '~/features/openai/server/models/thread-relation';
import VectorStoreModel, { type VectorStoreDocument } from '~/features/openai/server/models/vector-store';
import VectorStoreFileRelationModel, {
  type VectorStoreFileRelation,
  prepareVectorStoreFileRelations,
} from '~/features/openai/server/models/vector-store-file-relation';
import type { PageDocument, PageModel } from '~/server/models/page';
import { configManager } from '~/server/service/config-manager';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';

import { OpenaiServiceTypes } from '../../interfaces/ai';
import { type AiAssistant } from '../../interfaces/ai-assistant';
import AiAssistantModel, { type AiAssistantDocument } from '../models/ai-assistant';
import { convertMarkdownToHtml } from '../utils/convert-markdown-to-html';

import { getClient } from './client-delegator';
// import { splitMarkdownIntoChunks } from './markdown-splitter/markdown-token-splitter';
import { oepnaiApiErrorHandler } from './openai-api-error-handler';


const BATCH_SIZE = 100;

const logger = loggerFactory('growi:service:openai');

// const isVectorStoreForPublicScopeExist = false;

type VectorStoreFileRelationsMap = Map<string, VectorStoreFileRelation>

export interface IOpenaiService {
  getOrCreateThread(userId: string, vectorStoreId?: string, threadId?: string): Promise<OpenAI.Beta.Threads.Thread | undefined>;
  // getOrCreateVectorStoreForPublicScope(): Promise<VectorStoreDocument>;
  deleteExpiredThreads(limit: number, apiCallInterval: number): Promise<void>; // for CronJob
  deleteObsolatedVectorStoreRelations(): Promise<void> // for CronJob
  createVectorStoreFile(vectorStoreRelation: VectorStoreDocument, pages: PageDocument[]): Promise<void>;
  deleteVectorStoreFile(vectorStoreRelationId: Types.ObjectId, pageId: Types.ObjectId): Promise<void>;
  deleteObsoleteVectorStoreFile(limit: number, apiCallInterval: number): Promise<void>; // for CronJob
  // rebuildVectorStoreAll(): Promise<void>;
  // rebuildVectorStore(page: HydratedDocument<PageDocument>): Promise<void>;
  createAiAssistant(data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument>;
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
      await oepnaiApiErrorHandler(err, { notFoundError: async() => { await threadRelation.remove() } });
      throw new Error(err);
    }
  }

  public async deleteExpiredThreads(limit: number, apiCallInterval: number): Promise<void> {
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

        // sleep
        await new Promise(resolve => setTimeout(resolve, apiCallInterval));
      }
      catch (err) {
        logger.error(err);
      }
    }

    await ThreadRelationModel.deleteMany({ threadId: { $in: deletedThreadIds } });
  }

  // TODO: https://redmine.weseek.co.jp/issues/160332
  // public async getOrCreateVectorStoreForPublicScope(): Promise<VectorStoreDocument> {
  //   const vectorStoreDocument: VectorStoreDocument | null = await VectorStoreModel.findOne({ scopeType: VectorStoreScopeType.PUBLIC, isDeleted: false });

  //   if (vectorStoreDocument != null && isVectorStoreForPublicScopeExist) {
  //     return vectorStoreDocument;
  //   }

  //   if (vectorStoreDocument != null && !isVectorStoreForPublicScopeExist) {
  //     try {
  //       // Check if vector store entity exists
  //       // If the vector store entity does not exist, the vector store document is deleted
  //       await this.client.retrieveVectorStore(vectorStoreDocument.vectorStoreId);
  //       isVectorStoreForPublicScopeExist = true;
  //       return vectorStoreDocument;
  //     }
  //     catch (err) {
  //       await oepnaiApiErrorHandler(err, { notFoundError: vectorStoreDocument.markAsDeleted });
  //       throw new Error(err);
  //     }
  //   }

  //   const newVectorStore = await this.client.createVectorStore(VectorStoreScopeType.PUBLIC);
  //   const newVectorStoreDocument = await VectorStoreModel.create({
  //     vectorStoreId: newVectorStore.id,
  //     scopeType: VectorStoreScopeType.PUBLIC,
  //   }) as VectorStoreDocument;

  //   isVectorStoreForPublicScopeExist = true;

  //   return newVectorStoreDocument;
  // }

  private async createVectorStore(): Promise<VectorStoreDocument> {
    try {
      const newVectorStore = await this.client.createVectorStore();

      const newVectorStoreDocument = await VectorStoreModel.create({
        vectorStoreId: newVectorStore.id,
      }) as VectorStoreDocument;

      return newVectorStoreDocument;
    }
    catch (err) {
      throw new Error(err);
    }
  }

  // TODO: https://redmine.weseek.co.jp/issues/160332
  // TODO: https://redmine.weseek.co.jp/issues/156643
  // private async uploadFileByChunks(pageId: Types.ObjectId, body: string, vectorStoreFileRelationsMap: VectorStoreFileRelationsMap) {
  //   const chunks = await splitMarkdownIntoChunks(body, 'gpt-4o');
  //   for await (const [index, chunk] of chunks.entries()) {
  //     try {
  //       const file = await toFile(Readable.from(chunk), `${pageId}-chunk-${index}.md`);
  //       const uploadedFile = await this.client.uploadFile(file);
  //       prepareVectorStoreFileRelations(pageId, uploadedFile.id, vectorStoreFileRelationsMap);
  //     }
  //     catch (err) {
  //       logger.error(err);
  //     }
  //   }
  // }

  private async uploadFile(pageId: Types.ObjectId, pagePath: string, revisionBody: string): Promise<OpenAI.Files.FileObject> {
    const convertedHtml = await convertMarkdownToHtml({ pagePath, revisionBody });
    const file = await toFile(Readable.from(convertedHtml), `${pageId}.html`);
    const uploadedFile = await this.client.uploadFile(file);
    return uploadedFile;
  }

  // TODO: https://redmine.weseek.co.jp/issues/160333
  // private async deleteVectorStore(vectorStoreScopeType: VectorStoreScopeType): Promise<void> {
  //   const vectorStoreDocument: VectorStoreDocument | null = await VectorStoreModel.findOne({ scopeType: vectorStoreScopeType, isDeleted: false });
  //   if (vectorStoreDocument == null) {
  //     return;
  //   }

  //   try {
  //     await this.client.deleteVectorStore(vectorStoreDocument.vectorStoreId);
  //     await vectorStoreDocument.markAsDeleted();
  //   }
  //   catch (err) {
  //     await oepnaiApiErrorHandler(err, { notFoundError: vectorStoreDocument.markAsDeleted });
  //     throw new Error(err);
  //   }
  // }

  async createVectorStoreFile(vectorStoreRelation: VectorStoreDocument, pages: Array<HydratedDocument<PageDocument>>): Promise<void> {
    // const vectorStore = await this.getOrCreateVectorStoreForPublicScope();
    const vectorStoreFileRelationsMap: VectorStoreFileRelationsMap = new Map();
    const processUploadFile = async(page: HydratedDocument<PageDocument>) => {
      if (page._id != null && page.grant === PageGrant.GRANT_PUBLIC && page.revision != null) {
        if (isPopulated(page.revision) && page.revision.body.length > 0) {
          const uploadedFile = await this.uploadFile(page._id, page.path, page.revision.body);
          prepareVectorStoreFileRelations(vectorStoreRelation._id, page._id, uploadedFile.id, vectorStoreFileRelationsMap);
          return;
        }

        const pagePopulatedToShowRevision = await page.populateDataToShowRevision();
        if (pagePopulatedToShowRevision.revision != null && pagePopulatedToShowRevision.revision.body.length > 0) {
          const uploadedFile = await this.uploadFile(page._id, page.path, pagePopulatedToShowRevision.revision.body);
          prepareVectorStoreFileRelations(vectorStoreRelation._id, page._id, uploadedFile.id, vectorStoreFileRelationsMap);
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

    const pageIds = pages.map(page => page._id);

    try {
      // Save vector store file relation
      await VectorStoreFileRelationModel.upsertVectorStoreFileRelations(vectorStoreFileRelations);

      // Create vector store file
      const createVectorStoreFileBatchResponse = await this.client.createVectorStoreFileBatch(vectorStoreRelation.vectorStoreId, uploadedFileIds);
      logger.debug('Create vector store file', createVectorStoreFileBatchResponse);

      // Set isAttachedToVectorStore: true when the uploaded file is attached to VectorStore
      await VectorStoreFileRelationModel.markAsAttachedToVectorStore(pageIds);
    }
    catch (err) {
      logger.error(err);

      // Delete all uploaded files if createVectorStoreFileBatch fails
      for await (const pageId of pageIds) {
        await this.deleteVectorStoreFile(vectorStoreRelation._id, pageId);
      }
    }

  }

  // Deletes all VectorStore documents that are marked as deleted (isDeleted: true) and have no associated VectorStoreFileRelation documents
  async deleteObsolatedVectorStoreRelations(): Promise<void> {
    const deletedVectorStoreRelations = await VectorStoreModel.find({ isDeleted: true });
    if (deletedVectorStoreRelations.length === 0) {
      return;
    }

    const currentVectorStoreRelationIds: Types.ObjectId[] = await VectorStoreFileRelationModel.aggregate([
      {
        $group: {
          _id: '$vectorStoreRelationId',
          relationCount: { $sum: 1 },
        },
      },
      { $match: { relationCount: { $gt: 0 } } },
      { $project: { _id: 1 } },
    ]);

    if (currentVectorStoreRelationIds.length === 0) {
      return;
    }

    await VectorStoreModel.deleteMany({ _id: { $nin: currentVectorStoreRelationIds }, isDeleted: true });
  }

  async deleteVectorStoreFile(vectorStoreRelationId: Types.ObjectId, pageId: Types.ObjectId, apiCallInterval?: number): Promise<void> {
    // Delete vector store file and delete vector store file relation
    const vectorStoreFileRelation = await VectorStoreFileRelationModel.findOne({ vectorStoreRelationId, page: pageId });
    if (vectorStoreFileRelation == null) {
      return;
    }

    const deletedFileIds: string[] = [];
    for await (const fileId of vectorStoreFileRelation.fileIds) {
      try {
        const deleteFileResponse = await this.client.deleteFile(fileId);
        logger.debug('Delete vector store file', deleteFileResponse);
        deletedFileIds.push(fileId);
        if (apiCallInterval != null) {
          // sleep
          await new Promise(resolve => setTimeout(resolve, apiCallInterval));
        }
      }
      catch (err) {
        await oepnaiApiErrorHandler(err, { notFoundError: async() => { deletedFileIds.push(fileId) } });
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

  async deleteObsoleteVectorStoreFile(limit: number, apiCallInterval: number): Promise<void> {
    // Retrieves all VectorStore documents that are marked as deleted
    const deletedVectorStoreRelations = await VectorStoreModel.find({ isDeleted: true });
    if (deletedVectorStoreRelations.length === 0) {
      return;
    }

    // Retrieves VectorStoreFileRelation documents associated with deleted VectorStore documents
    const obsoleteVectorStoreFileRelations = await VectorStoreFileRelationModel.find(
      { vectorStoreRelationId: { $in: deletedVectorStoreRelations.map(deletedVectorStoreRelation => deletedVectorStoreRelation._id) } },
    ).limit(limit);
    if (obsoleteVectorStoreFileRelations.length === 0) {
      return;
    }

    // Delete obsolete VectorStoreFile
    for await (const vectorStoreFileRelation of obsoleteVectorStoreFileRelations) {
      try {
        await this.deleteVectorStoreFile(vectorStoreFileRelation.vectorStoreRelationId, vectorStoreFileRelation.page, apiCallInterval);
      }
      catch (err) {
        logger.error(err);
      }
    }
  }

  // TODO: https://redmine.weseek.co.jp/issues/160332
  // async rebuildVectorStoreAll() {
  //   await this.deleteVectorStore(VectorStoreScopeType.PUBLIC);

  //   // Create all public pages VectorStoreFile
  //   const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
  //   const pagesStream = Page.find({ grant: PageGrant.GRANT_PUBLIC }).populate('revision').cursor({ batch_size: BATCH_SIZE });
  //   const batchStrem = createBatchStream(BATCH_SIZE);

  //   const createVectorStoreFile = this.createVectorStoreFile.bind(this);
  //   const createVectorStoreFileStream = new Transform({
  //     objectMode: true,
  //     async transform(chunk: HydratedDocument<PageDocument>[], encoding, callback) {
  //       await createVectorStoreFile(chunk);
  //       this.push(chunk);
  //       callback();
  //     },
  //   });

  //   await pipeline(pagesStream, batchStrem, createVectorStoreFileStream);
  // }

  // async rebuildVectorStore(page: HydratedDocument<PageDocument>) {
  //   const vectorStore = await this.getOrCreateVectorStoreForPublicScope();
  //   await this.deleteVectorStoreFile(vectorStore._id, page._id);
  //   await this.createVectorStoreFile([page]);
  // }

  async createAiAssistant(data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument> {
    // 1. Get pages stream based on path patterns
    const conditions: Array<{path: string | RegExp}> = data.pagePathPatterns.map((path) => {
      if (path.endsWith('/*')) {
        const basePathWithoutGlob = path.slice(0, -2); // remove '/*'
        const pathWithTrailingSlash = addTrailingSlash(basePathWithoutGlob);
        const startsPattern = escapeStringRegexp(pathWithTrailingSlash);

        return { path: new RegExp(`^${startsPattern}`) };
      }
      return { path: normalizePath(path) };
    });

    // 2. Create vector store file transform stream
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');
    const pagesStream = Page.find({ $or: conditions })
      .populate('revision')
      .cursor({ batchSize: BATCH_SIZE });
    const batchStream = createBatchStream(BATCH_SIZE);

    const vectorStoreRelation = await this.createVectorStore();
    const createVectorStoreFile = this.createVectorStoreFile.bind(this);
    const createVectorStoreFileStream = new Transform({
      objectMode: true,
      async transform(chunk: HydratedDocument<PageDocument>[], encoding, callback) {
        try {
          await createVectorStoreFile(vectorStoreRelation, chunk);
          this.push(chunk);
          callback();
        }
        catch (error) {
          callback(error);
        }
      },
    });

    // 3. Process stream pipeline
    await pipeline(pagesStream, batchStream, createVectorStoreFileStream);

    // 4. Create AI Assistant with vector store (TODO)
    const aiAssistant = await AiAssistantModel.create({
      ...data, vectorStore: vectorStoreRelation,
    });

    return aiAssistant;
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
