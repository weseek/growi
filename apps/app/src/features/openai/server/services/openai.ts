import assert from 'node:assert';
import { Readable, Transform } from 'stream';
import { pipeline } from 'stream/promises';

import {
  PageGrant, getIdForRef, getIdStringForRef, isPopulated, type IUserHasId,
} from '@growi/core';
import { deepEquals } from '@growi/core/dist/utils';
import { isGrobPatternPath } from '@growi/core/dist/utils/page-path-utils';
import escapeStringRegexp from 'escape-string-regexp';
import createError from 'http-errors';
import mongoose, { type HydratedDocument, type Types } from 'mongoose';
import { type OpenAI, toFile } from 'openai';

import ExternalUserGroupRelation from '~/features/external-user-group/server/models/external-user-group-relation';
import ThreadRelationModel from '~/features/openai/server/models/thread-relation';
import VectorStoreModel, { type VectorStoreDocument } from '~/features/openai/server/models/vector-store';
import VectorStoreFileRelationModel, {
  type VectorStoreFileRelation,
  prepareVectorStoreFileRelations,
} from '~/features/openai/server/models/vector-store-file-relation';
import type { PageDocument, PageModel } from '~/server/models/page';
import UserGroupRelation from '~/server/models/user-group-relation';
import { configManager } from '~/server/service/config-manager';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';

import { OpenaiServiceTypes } from '../../interfaces/ai';
import {
  type AccessibleAiAssistants, type AiAssistant, AiAssistantAccessScope, AiAssistantShareScope,
} from '../../interfaces/ai-assistant';
import AiAssistantModel, { type AiAssistantDocument } from '../models/ai-assistant';
import { convertMarkdownToHtml } from '../utils/convert-markdown-to-html';

import { getClient } from './client-delegator';
// import { splitMarkdownIntoChunks } from './markdown-splitter/markdown-token-splitter';
import { openaiApiErrorHandler } from './openai-api-error-handler';

const { isDeepEquals } = deepEquals;

const BATCH_SIZE = 100;

const logger = loggerFactory('growi:service:openai');

// const isVectorStoreForPublicScopeExist = false;

type VectorStoreFileRelationsMap = Map<string, VectorStoreFileRelation>


const convertPathPatternsToRegExp = (pagePathPatterns: string[]): Array<string | RegExp> => {
  return pagePathPatterns.map((pagePathPattern) => {
    if (isGrobPatternPath(pagePathPattern)) {
      const trimedPagePathPattern = pagePathPattern.replace('/*', '');
      const escapedPagePathPattern = escapeStringRegexp(trimedPagePathPattern);
      return new RegExp(`^${escapedPagePathPattern}`);
    }

    return pagePathPattern;
  });
};


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
  updateAiAssistant(aiAssistantId: string, data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument>;
  getAccessibleAiAssistants(user: IUserHasId): Promise<AccessibleAiAssistants>
  deleteAiAssistant(ownerId: string, aiAssistantId: string): Promise<AiAssistantDocument>
}
class OpenaiService implements IOpenaiService {

  private get client() {
    const openaiServiceType = configManager.getConfig('openai:serviceType');
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
      await openaiApiErrorHandler(err, { notFoundError: async() => { await threadRelation.remove() } });
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

  private async createVectorStore(name: string): Promise<VectorStoreDocument> {
    try {
      const newVectorStore = await this.client.createVectorStore(name);

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

  private async deleteVectorStore(vectorStoreRelationId: string): Promise<void> {
    const vectorStoreDocument: VectorStoreDocument | null = await VectorStoreModel.findOne({ _id: vectorStoreRelationId, isDeleted: false });
    if (vectorStoreDocument == null) {
      return;
    }

    try {
      await this.client.deleteVectorStore(vectorStoreDocument.vectorStoreId);
      await vectorStoreDocument.markAsDeleted();
    }
    catch (err) {
      await openaiApiErrorHandler(err, { notFoundError: vectorStoreDocument.markAsDeleted });
      throw new Error(err);
    }
  }

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
        await openaiApiErrorHandler(err, { notFoundError: async() => { deletedFileIds.push(fileId) } });
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

  private async createVectorStoreFileWithStream(vectorStoreRelation: VectorStoreDocument, conditions: mongoose.FilterQuery<PageDocument>): Promise<void> {
    const Page = mongoose.model<HydratedDocument<PageDocument>, PageModel>('Page');

    const pagesStream = Page.find({ ...conditions })
      .populate('revision')
      .cursor({ batchSize: BATCH_SIZE });
    const batchStream = createBatchStream(BATCH_SIZE);

    const createVectorStoreFile = this.createVectorStoreFile.bind(this);
    const createVectorStoreFileStream = new Transform({
      objectMode: true,
      async transform(chunk: HydratedDocument<PageDocument>[], encoding, callback) {
        try {
          logger.debug('Search results of page paths', chunk.map(page => page.path));
          await createVectorStoreFile(vectorStoreRelation, chunk);
          this.push(chunk);
          callback();
        }
        catch (error) {
          callback(error);
        }
      },
    });

    await pipeline(pagesStream, batchStream, createVectorStoreFileStream);
  }

  private async createConditionForCreateVectorStoreFile(
      owner: AiAssistant['owner'],
      accessScope: AiAssistant['accessScope'],
      grantedGroupsForAccessScope: AiAssistant['grantedGroupsForAccessScope'],
      pagePathPatterns: AiAssistant['pagePathPatterns'],
  ): Promise<mongoose.FilterQuery<PageDocument>> {

    const converterdPagePathPatterns = convertPathPatternsToRegExp(pagePathPatterns);

    // Include pages in search targets when their paths with 'Anyone with the link' permission are directly specified instead of using glob pattern
    const nonGrabPagePathPatterns = pagePathPatterns.filter(pagePathPattern => !isGrobPatternPath(pagePathPattern));
    const baseCondition: mongoose.FilterQuery<PageDocument> = {
      grant: PageGrant.GRANT_RESTRICTED,
      path: { $in: nonGrabPagePathPatterns },
    };

    if (accessScope === AiAssistantAccessScope.PUBLIC_ONLY) {
      return {
        $or: [
          baseCondition,
          {
            grant: PageGrant.GRANT_PUBLIC,
            path: { $in: converterdPagePathPatterns },
          },
        ],
      };
    }

    if (accessScope === AiAssistantAccessScope.GROUPS) {
      if (grantedGroupsForAccessScope == null || grantedGroupsForAccessScope.length === 0) {
        throw new Error('grantedGroups is required when accessScope is GROUPS');
      }

      const extractedGrantedGroupIdsForAccessScope = grantedGroupsForAccessScope.map(group => getIdForRef(group.item).toString());

      return {
        $or: [
          baseCondition,
          {
            grant: { $in: [PageGrant.GRANT_PUBLIC, PageGrant.GRANT_USER_GROUP] },
            path: { $in: converterdPagePathPatterns },
            $or: [
              { 'grantedGroups.item': { $in: extractedGrantedGroupIdsForAccessScope } },
              { grant: PageGrant.GRANT_PUBLIC },
            ],
          },
        ],
      };
    }

    if (accessScope === AiAssistantAccessScope.OWNER) {
      const ownerUserGroups = [
        ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(owner)),
        ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(owner)),
      ].map(group => group.toString());

      return {
        $or: [
          baseCondition,
          {
            grant: { $in: [PageGrant.GRANT_PUBLIC, PageGrant.GRANT_USER_GROUP, PageGrant.GRANT_OWNER] },
            path: { $in: converterdPagePathPatterns },
            $or: [
              { 'grantedGroups.item': { $in: ownerUserGroups } },
              { grantedUsers: { $in: [getIdForRef(owner)] } },
              { grant: PageGrant.GRANT_PUBLIC },
            ],
          },
        ],
      };
    }

    throw new Error('Invalid accessScope value');
  }

  private async validateGrantedUserGroupsForAiAssistant(
      owner: AiAssistant['owner'],
      shareScope: AiAssistant['shareScope'],
      accessScope: AiAssistant['accessScope'],
      grantedGroupsForShareScope: AiAssistant['grantedGroupsForShareScope'],
      grantedGroupsForAccessScope: AiAssistant['grantedGroupsForAccessScope'],
  ) {

    // Check if grantedGroupsForShareScope is not specified when shareScope is not a “group”
    if (shareScope !== AiAssistantShareScope.GROUPS && grantedGroupsForShareScope != null) {
      throw new Error('grantedGroupsForShareScope is specified when shareScope is not “groups”.');
    }

    // Check if grantedGroupsForAccessScope is not specified when accessScope is not a “group”
    if (accessScope !== AiAssistantAccessScope.GROUPS && grantedGroupsForAccessScope != null) {
      throw new Error('grantedGroupsForAccessScope is specified when accsessScope is not “groups”.');
    }

    const ownerUserGroupIds = [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(owner)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(owner)),
    ].map(group => group.toString());

    // Check if the owner belongs to the group specified in grantedGroupsForShareScope
    if (grantedGroupsForShareScope != null && grantedGroupsForShareScope.length > 0) {
      const extractedGrantedGroupIdsForShareScope = grantedGroupsForShareScope.map(group => getIdForRef(group.item).toString());
      const isValid = extractedGrantedGroupIdsForShareScope.every(groupId => ownerUserGroupIds.includes(groupId));
      if (!isValid) {
        throw new Error('A userGroup to which the owner does not belong is specified in grantedGroupsForShareScope');
      }
    }

    // Check if the owner belongs to the group specified in grantedGroupsForAccessScope
    if (grantedGroupsForAccessScope != null && grantedGroupsForAccessScope.length > 0) {
      const extractedGrantedGroupIdsForAccessScope = grantedGroupsForAccessScope.map(group => getIdForRef(group.item).toString());
      const isValid = extractedGrantedGroupIdsForAccessScope.every(groupId => ownerUserGroupIds.includes(groupId));
      if (!isValid) {
        throw new Error('A userGroup to which the owner does not belong is specified in grantedGroupsForAccessScope');
      }
    }
  }

  async createAiAssistant(data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument> {
    await this.validateGrantedUserGroupsForAiAssistant(
      data.owner,
      data.shareScope,
      data.accessScope,
      data.grantedGroupsForShareScope,
      data.grantedGroupsForAccessScope,
    );

    const conditions = await this.createConditionForCreateVectorStoreFile(
      data.owner,
      data.accessScope,
      data.grantedGroupsForAccessScope,
      data.pagePathPatterns,
    );

    const vectorStoreRelation = await this.createVectorStore(data.name);
    const aiAssistant = await AiAssistantModel.create({
      ...data, vectorStore: vectorStoreRelation,
    });

    // VectorStore creation process does not await
    this.createVectorStoreFileWithStream(vectorStoreRelation, conditions);

    return aiAssistant;
  }

  async updateAiAssistant(aiAssistantId: string, data: Omit<AiAssistant, 'vectorStore'>): Promise<AiAssistantDocument> {
    const aiAssistant = await AiAssistantModel.findOne({ owner: data.owner, _id: aiAssistantId });
    if (aiAssistant == null) {
      throw createError(404, 'AiAssistant document does not exist');
    }

    await this.validateGrantedUserGroupsForAiAssistant(
      data.owner,
      data.shareScope,
      data.accessScope,
      data.grantedGroupsForShareScope,
      data.grantedGroupsForAccessScope,
    );

    const grantedGroupIdsForAccessScopeFromReq = data.grantedGroupsForAccessScope?.map(group => getIdStringForRef(group.item)) ?? []; // ObjectId[] -> string[]
    const grantedGroupIdsForAccessScopeFromDb = aiAssistant.grantedGroupsForAccessScope?.map(group => getIdStringForRef(group.item)) ?? []; // ObjectId[] -> string[]

    // If accessScope, pagePathPatterns, grantedGroupsForAccessScope have not changed, do not build VectorStore
    const shouldRebuildVectorStore = data.accessScope !== aiAssistant.accessScope
      || !isDeepEquals(data.pagePathPatterns, aiAssistant.pagePathPatterns)
      || !isDeepEquals(grantedGroupIdsForAccessScopeFromReq, grantedGroupIdsForAccessScopeFromDb);

    let newVectorStoreRelation: VectorStoreDocument | undefined;
    if (shouldRebuildVectorStore) {
      const conditions = await this.createConditionForCreateVectorStoreFile(
        data.owner,
        data.accessScope,
        data.grantedGroupsForAccessScope,
        data.pagePathPatterns,
      );

      // Delete obsoleted VectorStore
      const obsoletedVectorStoreRelationId = getIdStringForRef(aiAssistant.vectorStore);
      await this.deleteVectorStore(obsoletedVectorStoreRelationId);

      newVectorStoreRelation = await this.createVectorStore(data.name);

      // VectorStore creation process does not await
      this.createVectorStoreFileWithStream(newVectorStoreRelation, conditions);
    }

    const newData = {
      ...data,
      vectorStore: newVectorStoreRelation ?? aiAssistant.vectorStore,
    };

    aiAssistant.set({ ...newData });
    const updatedAiAssistant = await aiAssistant.save();

    return updatedAiAssistant;
  }

  async getAccessibleAiAssistants(user: IUserHasId): Promise<AccessibleAiAssistants> {
    const userGroupIds = [
      ...(await UserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
      ...(await ExternalUserGroupRelation.findAllUserGroupIdsRelatedToUser(user)),
    ];

    const assistants = await AiAssistantModel.find({
      $or: [
        // Case 1: Assistants owned by the user
        { owner: user },

        // Case 2: Public assistants owned by others
        {
          $and: [
            { owner: { $ne: user } },
            { shareScope: AiAssistantShareScope.PUBLIC_ONLY },
          ],
        },

        // Case 3: Group-restricted assistants where user is in granted groups
        {
          $and: [
            { owner: { $ne: user } },
            { shareScope: AiAssistantShareScope.GROUPS },
            { 'grantedGroupsForShareScope.item': { $in: userGroupIds } },
          ],
        },
      ],
    });

    return {
      myAiAssistants: assistants.filter(assistant => assistant.owner.toString() === user._id.toString()) ?? [],
      teamAiAssistants: assistants.filter(assistant => assistant.owner.toString() !== user._id.toString()) ?? [],
    };
  }

  async deleteAiAssistant(ownerId: string, aiAssistantId: string): Promise<AiAssistantDocument> {
    const aiAssistant = await AiAssistantModel.findOne({ owner: ownerId, _id: aiAssistantId });
    if (aiAssistant == null) {
      throw createError(404, 'AiAssistant document does not exist');
    }

    const vectorStoreRelationId = getIdStringForRef(aiAssistant.vectorStore);
    await this.deleteVectorStore(vectorStoreRelationId);

    const deletedAiAssistant = await aiAssistant.remove();
    return deletedAiAssistant;
  }

}

let instance: OpenaiService;
export const getOpenaiService = (): IOpenaiService | undefined => {
  if (instance != null) {
    return instance;
  }

  const aiEnabled = configManager.getConfig('app:aiEnabled');
  const openaiServiceType = configManager.getConfig('openai:serviceType');
  if (aiEnabled && openaiServiceType != null && OpenaiServiceTypes.includes(openaiServiceType)) {
    instance = new OpenaiService();
    return instance;
  }

  return;
};
