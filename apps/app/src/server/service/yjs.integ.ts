import mongoose, { Types } from 'mongoose';
import type { Server } from 'socket.io';
import { mock } from 'vitest-mock-extended';
import { MongodbPersistence } from 'y-mongodb-provider';

import { Revision } from '../models/revision';
import { getMongoUri } from '../util/mongoose-utils';

import { getYjsService, initializeYjsService } from './yjs';


vi.mock('y-socket.io/dist/server', () => {
  const YSocketIO = vi.fn();
  YSocketIO.prototype.initialize = vi.fn();
  return { YSocketIO };
});


const ObjectId = Types.ObjectId;

describe('YjsService', () => {

  describe('hasYdocsNewerThanLatestRevision()', () => {

    const mdb: MongodbPersistence = new MongodbPersistence(getMongoUri(), {
      collectionName: 'yjs-writings',
    });

    beforeAll(async() => {
      const ioMock = mock<Server>();
      initializeYjsService(ioMock);
    });

    afterAll(() => {
      Revision.deleteMany({});
      mongoose.connection.collection('yjs-writings').deleteMany({});
    });

    it('returns false when neither revisions nor YDocs exists', async() => {
      // arrange
      const pageId = new ObjectId();

      // act
      const yjsService = getYjsService();
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns true when no revisions exist', async() => {
      // arrange
      const pageId = new ObjectId();

      await mdb.setMeta(pageId.toString(), 'updatedAt', 1000);

      // act
      const yjsService = getYjsService();
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(true);
    });

    it('returns false when the latest revision is newer than meta data', async() => {
      // arrange
      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      await mdb.setMeta(pageId.toString(), 'updatedAt', (new Date(2024, 1, 1)).getTime());

      // act
      const yjsService = getYjsService();
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns false when no YDocs exist', async() => {
      // arrange
      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      // act
      const yjsService = getYjsService();
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns true when the newer YDocs exist', async() => {
      // arrange
      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      await mdb.setMeta(pageId.toString(), 'updatedAt', (new Date(2034, 1, 1)).getTime());

      // act
      const yjsService = getYjsService();
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(true);
    });

  });
});
