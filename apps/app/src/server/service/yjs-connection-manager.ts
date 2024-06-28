import type { Server } from 'socket.io';
import { MongodbPersistence } from 'y-mongodb-provider';
import { YSocketIO, type Document as Ydoc } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import { getMongoUri } from '../util/mongoose-utils';

const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;

export const extractPageIdFromYdocId = (ydocId: string): string | undefined => {
  const result = ydocId.match(/yjs\/(.*)/);
  return result?.[1];
};

class YjsConnectionManager {

  private static instance: YjsConnectionManager;

  private ysocketio: YSocketIO;

  private mdb: MongodbPersistence;

  get ysocketioInstance(): YSocketIO {
    return this.ysocketio;
  }

  get mdbInstance(): MongodbPersistence {
    return this.mdb;
  }

  private constructor(io: Server) {
    this.ysocketio = new YSocketIO(io);
    this.ysocketio.initialize();

    this.mdb = new MongodbPersistence(getMongoUri(), {
      collectionName: MONGODB_PERSISTENCE_COLLECTION_NAME,
      flushSize: MONGODB_PERSISTENCE_FLUSH_SIZE,
    });
  }

  public static getInstance(io?: Server) {
    if (this.instance != null) {
      return this.instance;
    }

    if (io == null) {
      throw new Error("'io' is required if initialize YjsConnectionManager");
    }

    this.instance = new YjsConnectionManager(io);
    return this.instance;
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

export const instantiateYjsConnectionManager = (io: Server): YjsConnectionManager => {
  return YjsConnectionManager.getInstance(io);
};

// export the singleton instance
export const getYjsConnectionManager = (): YjsConnectionManager => {
  return YjsConnectionManager.getInstance();
};
