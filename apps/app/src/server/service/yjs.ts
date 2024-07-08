import { GlobalSocketEventName } from '@growi/core';
import type { Server } from 'socket.io';
import { MongodbPersistence } from 'y-mongodb-provider';
import type { Document } from 'y-socket.io/dist/server';
import { YSocketIO, type Document as Ydoc } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import { SocketEventName } from '~/interfaces/websocket';
import loggerFactory from '~/utils/logger';

import { getMongoUri } from '../util/mongoose-utils';
import { RoomPrefix, getRoomNameWithId } from '../util/socket-io-helpers';

import type { IPageService } from './page';


const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;


const logger = loggerFactory('growi:service:yjs');


export const extractPageIdFromYdocId = (ydocId: string): string | undefined => {
  const result = ydocId.match(/yjs\/(.*)/);
  return result?.[1];
};

class YjsService {

  private ysocketio: YSocketIO;

  private mdb: MongodbPersistence;

  constructor(io: Server, pageService: IPageService) {
    const ysocketio = new YSocketIO(io);
    ysocketio.initialize();
    this.ysocketio = ysocketio;

    this.mdb = new MongodbPersistence(getMongoUri(), {
      collectionName: MONGODB_PERSISTENCE_COLLECTION_NAME,
      flushSize: MONGODB_PERSISTENCE_FLUSH_SIZE,
    });

    io.on('connection', (socket) => {

      ysocketio.on('awareness-update', async(doc: Document) => {
        const pageId = extractPageIdFromYdocId(doc.name);

        if (pageId == null) return;

        const awarenessStateSize = doc.awareness.states.size;

        // Triggered when awareness changes
        io
          .in(getRoomNameWithId(RoomPrefix.PAGE, pageId))
          .emit(SocketEventName.YjsAwarenessStateSizeUpdated, awarenessStateSize);

        // Triggered when the last user leaves the editor
        if (awarenessStateSize === 0) {
          const currentYdoc = this.getCurrentYdoc(pageId);
          const yjsDraft = currentYdoc?.getText('codemirror').toString();
          const hasRevisionBodyDiff = await pageService.hasRevisionBodyDiff(pageId, yjsDraft);
          io
            .in(getRoomNameWithId(RoomPrefix.PAGE, pageId))
            .emit(SocketEventName.YjsHasRevisionBodyDiffUpdated, hasRevisionBodyDiff);
        }
      });

      socket.on(GlobalSocketEventName.YDocSync, async({ pageId, initialValue }) => {
        try {
          await this.handleYDocSync(pageId, initialValue);
        }
        catch (error) {
          logger.warn(error.message);
          socket.emit(GlobalSocketEventName.YDocSyncError, 'An error occurred during YDoc synchronization.');
        }
      });
    });
  }

  public async handleYDocSync(pageId: string, initialValue: string): Promise<void> {
    const currentYdoc = this.getCurrentYdoc(pageId);
    if (currentYdoc == null) {
      return;
    }

    const persistedYdoc = await this.getPersistedYdoc(pageId);
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);

    await this.mdb.flushDocument(pageId);

    // If no write operation has been performed, insert initial value
    const clientsSize = persistedYdoc.store.clients.size;
    if (clientsSize === 0) {
      currentYdoc.getText('codemirror').insert(0, initialValue);
    }

    const diff = Y.encodeStateAsUpdate(currentYdoc, persistedStateVector);

    if (diff.reduce((prev, curr) => prev + curr, 0) > 0) {
      this.mdb.storeUpdate(pageId, diff);
    }

    Y.applyUpdate(currentYdoc, Y.encodeStateAsUpdate(persistedYdoc));

    currentYdoc.on('update', async(update) => {
      await this.mdb.storeUpdate(pageId, update);
    });

    currentYdoc.on('destroy', async() => {
      await this.mdb.flushDocument(pageId);
    });

    persistedYdoc.destroy();
  }

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
    const currentYdoc = this.ysocketio.documents.get(`yjs/${pageId}`);
    return currentYdoc;
  }

  public async getPersistedYdoc(pageId: string): Promise<Y.Doc> {
    const persistedYdoc = await this.mdb.getYDoc(pageId);
    return persistedYdoc;
  }

}

let _instance: YjsService;

export const initializeYjsService = (io: Server, pageService: IPageService): void => {
  if (_instance != null) {
    throw new Error('YjsService is already initialized');
  }

  if (io == null) {
    throw new Error("'io' is required if initialize YjsService");
  }

  _instance = new YjsService(io, pageService);
};

export const getYjsService = (): YjsService => {
  if (_instance == null) {
    throw new Error('YjsService is not initialized yet');
  }

  return _instance;
};
