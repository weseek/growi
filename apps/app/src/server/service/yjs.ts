import type { IRevisionHasId } from '@growi/core';
import { GlobalSocketEventName } from '@growi/core';
import mongoose from 'mongoose';
import type { Server } from 'socket.io';
import { MongodbPersistence } from 'y-mongodb-provider';
import type { Document, Persistence } from 'y-socket.io/dist/server';
import { YSocketIO, type Document as Ydoc } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import { SocketEventName } from '~/interfaces/websocket';
import loggerFactory from '~/utils/logger';

import { Revision } from '../models/revision';
import { RoomPrefix, getRoomNameWithId } from '../util/socket-io-helpers';


const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;


const logger = loggerFactory('growi:service:yjs');


// export const extractPageIdFromYdocId = (ydocId: string): string | undefined => {
//   const result = ydocId.match(/yjs\/(.*)/);
//   return result?.[1];
// };

export interface IYjsService {
  hasYdocsNewerThanLatestRevision(pageId: string): Promise<boolean>;
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

    this.createIndexes();

    ysocketio.on('document-loaded', async(doc: Document) => {
      // const pageId = extractPageIdFromYdocId(doc.name);
      const pageId = doc.name;

      if (pageId != null && !await this.hasYdocsNewerThanLatestRevision(pageId)) {
        logger.debug(`YDoc for the page ('${pageId}') is initialized by the latest revision body`);

        const revision = await Revision.findOne({ pageId });
        if (revision?.body != null) {
          doc.getText('codemirror').insert(0, revision.body);
        }
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
    const persistece: Persistence = {
      provider: mdb,
      bindState: async(docName, ydoc) => {
        logger.debug('bindState', { docName });

        const persistedYdoc = await mdb.getYDoc(docName);
        // get the state vector so we can just store the diffs between client and server
        const persistedStateVector = Y.encodeStateVector(persistedYdoc);

        /* we could also retrieve that sv with a mdb function
         *  however this takes longer;
         *  it would also flush the document (which merges all updates into one)
         *   thats prob a good thing, which is why we always do this on document close (see writeState)
         */
        // const persistedStateVector = await mdb.getStateVector(docName);

        // in the default code the following value gets saved in the db
        //  this however leads to the case that multiple complete Y.Docs are saved in the db (https://github.com/fadiquader/y-mongodb/issues/7)
        // const newUpdates = Y.encodeStateAsUpdate(ydoc);

        // better just get the differences and save those:
        const diff = Y.encodeStateAsUpdate(ydoc, persistedStateVector);

        // store the new data in db (if there is any: empty update is an array of 0s)
        if (diff.reduce((previousValue, currentValue) => previousValue + currentValue, 0) > 0) {
          mdb.storeUpdate(docName, diff);
          mdb.setMeta(docName, 'updatedAt', Date.now());
        }

        // send the persisted data to clients
        Y.applyUpdate(ydoc, Y.encodeStateAsUpdate(persistedYdoc));

        // store updates of the document in db
        ydoc.on('update', async(update) => {
          mdb.storeUpdate(docName, update);
          mdb.setMeta(docName, 'updatedAt', Date.now());
        });

        // cleanup some memory
        persistedYdoc.destroy();
      },
      writeState: async(docName) => {
        logger.debug('writeState', { docName });
        // This is called when all connections to the document are closed.

        // flush document on close to have the smallest possible database
        await mdb.flushDocument(docName);
      },
    };

    // foce set to private property
    // eslint-disable-next-line dot-notation
    ysocketio['persistence'] = persistece;
  }

  private async createIndexes(): Promise<void> {

    const collection = mongoose.connection.collection(MONGODB_PERSISTENCE_COLLECTION_NAME);

    try {
      await collection.createIndexes([
        {
          key: {
            version: 1,
            docName: 1,
            action: 1,
            clock: 1,
            part: 1,
          },
        },
        // for metaKey
        {
          key: {
            version: 1,
            docName: 1,
            metaKey: 1,
          },
        },
        // for flushDocument / clearDocument
        {
          key: {
            docName: 1,
            clock: 1,
          },
        },
      ]);
    }
    catch (err) {
      logger.error('Failed to create Index', err);
      throw err;
    }
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
    const ydocUpdatedAt: number | undefined = await this.mdb.getMeta(pageId, 'updatedAt');

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
