import type { Server } from 'socket.io';
import { MongodbPersistence } from 'y-mongodb-provider';
import { YSocketIO } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import { getMongoUri } from '../util/mongoose-utils';

const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;

class YjsConnectionManager {

  private static instance: YjsConnectionManager | undefined;

  private ysocketio: YSocketIO;

  private mdb: MongodbPersistence;

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
    const persistedYdoc = await this.mdb.getYDoc(pageId);
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);

    await this.mdb.flushDocument(pageId);

    const currentYdoc = this.getCurrentYdoc(pageId);

    const persistedCodeMirrorText = persistedYdoc.getText('codemirror').toString();
    const currentCodeMirrorText = currentYdoc.getText('codemirror').toString();

    if (persistedCodeMirrorText === '' && currentCodeMirrorText === '') {
      console.log('はいるよ', initialValue);
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
    const currentMarkdownLength = currentYdoc.getText('codemirror').length;
    currentYdoc.getText('codemirror').delete(0, currentMarkdownLength);
    currentYdoc.getText('codemirror').insert(0, newValue);
    Y.encodeStateAsUpdate(currentYdoc);
  }

  private getCurrentYdoc(pageId: string): Y.Doc {
    const currentYdoc = this.ysocketio.documents.get(`yjs/${pageId}`);
    if (currentYdoc == null) {
      throw new Error(`currentYdoc for pageId ${pageId} is undefined.`);
    }
    return currentYdoc;
  }

}

// export the singleton instance
export const getYjsConnectionManager = (io?: Server): YjsConnectionManager => {
  return YjsConnectionManager.getInstance(io);
};
