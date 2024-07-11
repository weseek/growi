import type { IncomingMessage } from 'http';

import type { IPage, IUserHasId } from '@growi/core';
import { YDocStatus } from '@growi/core/dist/consts';
import mongoose from 'mongoose';
import type { Server } from 'socket.io';
import type { Document } from 'y-socket.io/dist/server';
import { YSocketIO, type Document as Ydoc } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import loggerFactory from '~/utils/logger';

import type { PageModel } from '../../models/page';
import { Revision } from '../../models/revision';

import { createIndexes } from './create-indexes';
import { createMongoDBPersistence } from './create-mongodb-persistence';
import { MongodbPersistence } from './extended/mongodb-persistence';


const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;


const logger = loggerFactory('growi:service:yjs');


// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Delta = Array<{insert?:Array<any>|string, delete?:number, retain?:number}>;
type RequestWithUser = IncomingMessage & { user: IUserHasId };


export interface IYjsService {
  getYDocStatus(pageId: string): Promise<YDocStatus>;
  // handleYDocSync(pageId: string, initialValue: string): Promise<void>;
  handleYDocUpdate(pageId: string, newValue: string): Promise<void>;
  getCurrentYdoc(pageId: string): Ydoc | undefined;
}


class YjsService implements IYjsService {

  private ysocketio: YSocketIO;

  private mdb: MongodbPersistence;

  constructor(io: Server) {

    const mdb = new MongodbPersistence(
      // ignore TS2345: Argument of type '{ client: any; db: any; }' is not assignable to parameter of type 'string'.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      {
        // TODO: Required upgrading mongoose and unifying the versions of mongodb to omit 'as any'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        client: mongoose.connection.getClient() as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        db: mongoose.connection.db as any,
      },
      {
        collectionName: MONGODB_PERSISTENCE_COLLECTION_NAME,
        flushSize: MONGODB_PERSISTENCE_FLUSH_SIZE,
      },
    );
    this.mdb = mdb;

    const ysocketio = new YSocketIO(io);
    this.injectPersistence(ysocketio, mdb);
    ysocketio.initialize();
    this.ysocketio = ysocketio;

    createIndexes(MONGODB_PERSISTENCE_COLLECTION_NAME);

    // check accessible page
    ysocketio.nsp?.use(async(socket, next) => {
      // extract page id from namespace
      const pageId = socket.nsp.name.replace(/\/yjs\|/, '');
      const user = (socket.request as RequestWithUser).user; // should be injected by SocketIOService

      const Page = mongoose.model<IPage, PageModel>('Page');
      const isAccessible = await Page.isAccessiblePageByViewer(pageId, user);

      if (!isAccessible) {
        return next(new Error('Forbidden'));
      }

      return next();
    });

    ysocketio.on('document-loaded', async(doc: Document) => {
      const pageId = doc.name;

      if (pageId == null) {
        return;
      }

      const ydocStatus = await this.getYDocStatus(pageId);
      const shouldSync = ydocStatus === YDocStatus.NEW || ydocStatus === YDocStatus.OUTDATED;

      if (shouldSync) {
        logger.debug(`Initialize the page ('${pageId}') with the latest revision body`);

        const revision = await Revision
          .findOne({ pageId })
          .sort({ createdAt: -1 })
          .lean();

        if (revision?.body != null) {
          const ytext = doc.getText('codemirror');
          const delta: Delta = (ydocStatus === YDocStatus.OUTDATED && ytext.length > 0)
            ? [
              { delete: ytext.length },
              { insert: revision.body },
            ]
            : [
              { insert: revision.body },
            ];

          ytext.applyDelta(delta, { sanitize: false });
        }

        mdb.setMeta(doc.name, 'updatedAt', revision?.createdAt.getTime() ?? Date.now());
      }
    });

    // io.on('connection', (socket) => {

    //   ysocketio.on('awareness-update', async(doc: Document) => {
    //     const pageId = extractPageIdFromYdocId(doc.name);

    //     if (pageId == null) return;

    //     const awarenessStateSize = doc.awareness.states.size;

    //     // Triggered when awareness changes
    //     io
    //       .in(getRoomNameWithId(RoomPrefix.PAGE, pageId))
    //       .emit(SocketEventName.YjsAwarenessStateSizeUpdated, awarenessStateSize);

    //     // Triggered when the last user leaves the editor
    //     if (awarenessStateSize === 0) {
    //       const hasYdocsNewerThanLatestRevision = await this.hasYdocsNewerThanLatestRevision(pageId);
    //       io
    //         .in(getRoomNameWithId(RoomPrefix.PAGE, pageId))
    //         .emit(SocketEventName.YjsHasYdocsNewerThanLatestRevisionUpdated, hasYdocsNewerThanLatestRevision);
    //     }
    //   });

    //   socket.on(GlobalSocketEventName.YDocSync, async({ pageId, initialValue }) => {
    //     try {
    //       await this.handleYDocSync(pageId, initialValue);
    //     }
    //     catch (error) {
    //       logger.warn(error.message);
    //       socket.emit(GlobalSocketEventName.YDocSyncError, 'An error occurred during YDoc synchronization.');
    //     }
    //   });
    // });
  }

  private injectPersistence(ysocketio: YSocketIO, mdb: MongodbPersistence): void {
    const persistece = createMongoDBPersistence(mdb);

    // foce set to private property
    // eslint-disable-next-line dot-notation
    ysocketio['persistence'] = persistece;
  }

  public async getYDocStatus(pageId: string): Promise<YDocStatus> {
    const dumpLog = (status: YDocStatus, args?: { [key: string]: number }) => {
      logger.debug(`getYDocStatus('${pageId}') detected '${status}'`, args ?? {});
    };

    // get the latest revision createdAt
    const result = await Revision
      .findOne(
        // filter
        { pageId },
        // projection
        { createdAt: 1 },
        { sort: { createdAt: -1 } },
      );

    if (result == null) {
      dumpLog(YDocStatus.ISOLATED);
      return YDocStatus.ISOLATED;
    }

    // count yjs-writings documents with updatedAt > latestRevision.updatedAt
    const ydocUpdatedAt = await this.mdb.getTypedMeta(pageId, 'updatedAt');

    if (ydocUpdatedAt == null) {
      dumpLog(YDocStatus.NEW);
      return YDocStatus.NEW;
    }

    const { createdAt } = result;
    const lastRevisionCreatedAt = createdAt.getTime();

    if (lastRevisionCreatedAt < ydocUpdatedAt) {
      dumpLog(YDocStatus.DRAFT, { lastRevisionCreatedAt, ydocUpdatedAt });
      return YDocStatus.DRAFT;
    }

    if (lastRevisionCreatedAt === ydocUpdatedAt) {
      dumpLog(YDocStatus.SYNCED, { lastRevisionCreatedAt, ydocUpdatedAt });
      return YDocStatus.SYNCED;
    }

    dumpLog(YDocStatus.OUTDATED, { lastRevisionCreatedAt, ydocUpdatedAt });
    return YDocStatus.OUTDATED;
  }

  // public async handleYDocSync(pageId: string, initialValue: string): Promise<void> {
  //   const currentYdoc = this.getCurrentYdoc(pageId);
  //   if (currentYdoc == null) {
  //     return;
  //   }

  //   const persistedYdoc = await this.getPersistedYdoc(pageId);
  //   const persistedStateVector = Y.encodeStateVector(persistedYdoc);

  //   await this.mdb.flushDocument(pageId);

  //   // If no write operation has been performed, insert initial value
  //   const clientsSize = persistedYdoc.store.clients.size;
  //   if (clientsSize === 0) {
  //     currentYdoc.getText('codemirror').insert(0, initialValue);
  //   }

  //   const diff = Y.encodeStateAsUpdate(currentYdoc, persistedStateVector);

  //   if (diff.reduce((prev, curr) => prev + curr, 0) > 0) {
  //     this.mdb.storeUpdate(pageId, diff);
  //     this.mdb.setMeta(pageId, 'updatedAt', Date.now());
  //   }

  //   Y.applyUpdate(currentYdoc, Y.encodeStateAsUpdate(persistedYdoc));

  //   currentYdoc.on('update', async(update) => {
  //     this.mdb.storeUpdate(pageId, update);
  //     this.mdb.setMeta(pageId, 'updatedAt', Date.now());
  //   });

  //   currentYdoc.on('destroy', async() => {
  //     this.mdb.flushDocument(pageId);
  //   });

  //   persistedYdoc.destroy();
  // }

  public async handleYDocUpdate(pageId: string, newValue: string): Promise<void> {
    // TODO: https://redmine.weseek.co.jp/issues/132775
    // It's necessary to confirm that the user is not editing the target page in the Editor
    const currentYdoc = this.getCurrentYdoc(pageId);
    if (currentYdoc == null) {
      return;
    }

    const currentMarkdownLength = currentYdoc.getText('codemirror').length;
    currentYdoc.getText('codemirror').delete(0, currentMarkdownLength);
    currentYdoc.getText('codemirror').insert(0, newValue);
    Y.encodeStateAsUpdate(currentYdoc);
  }

  public getCurrentYdoc(pageId: string): Ydoc | undefined {
    const currentYdoc = this.ysocketio.documents.get(pageId);
    return currentYdoc;
  }

}

let _instance: YjsService;

export const initializeYjsService = (io: Server): void => {
  if (_instance != null) {
    throw new Error('YjsService is already initialized');
  }

  if (io == null) {
    throw new Error("'io' is required if initialize YjsService");
  }

  _instance = new YjsService(io);
};

export const getYjsService = (): YjsService => {
  if (_instance == null) {
    throw new Error('YjsService is not initialized yet');
  }

  return _instance;
};
