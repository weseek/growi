import type { Server } from 'socket.io';
import { MongodbPersistence } from 'y-mongodb-provider';
import { YSocketIO } from 'y-socket.io/dist/server';
import * as Y from 'yjs';

import { getMongoUri } from '../util/mongoose-utils';

export const MONGODB_PERSISTENCE_COLLECTION_NAME = 'yjs-writings';
export const MONGODB_PERSISTENCE_FLUSH_SIZE = 100;

class YjsConnectionManager {

  private ysocketio: YSocketIO;

  private mdb: MongodbPersistence;

  constructor(io: Server) {
    this.ysocketio = new YSocketIO(io);
    this.ysocketio.initialize();

    this.mdb = new MongodbPersistence(getMongoUri(), {
      collectionName: MONGODB_PERSISTENCE_COLLECTION_NAME,
      flushSize: MONGODB_PERSISTENCE_FLUSH_SIZE,
    });

    this.getCurrentYdoc = this.getCurrentYdoc.bind(this);
  }

  public async handleYDocSync(pageId: string, initialValue: string): Promise<void> {
    const persistedYdoc = await this.mdb.getYDoc(pageId);
    const persistedStateVector = Y.encodeStateVector(persistedYdoc);

    await this.mdb.flushDocument(pageId);

    const currentYdoc = this.getCurrentYdoc(pageId);

    const persistedCodeMirrorText = persistedYdoc.getText('codemirror').toString();
    const currentCodeMirrorText = currentYdoc.getText('codemirror').toString();

    if (persistedCodeMirrorText === '' && currentCodeMirrorText === '') {
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

  private getCurrentYdoc(pageId: string): Y.Doc {
    const currentYdoc = this.ysocketio.documents.get(`yjs/${pageId}`);
    if (currentYdoc == null) {
      throw new Error(`currentYdoc for pageId ${pageId} is undefined.`);
    }
    return currentYdoc;
  }

}

export default YjsConnectionManager;
