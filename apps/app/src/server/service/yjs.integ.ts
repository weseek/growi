import { Types } from 'mongoose';
import type { Server } from 'socket.io';
import { mock } from 'vitest-mock-extended';
import type { MongodbPersistence } from 'y-mongodb-provider';

import { Revision } from '../models/revision';

import type { IYjsService } from './yjs';
import { getYjsService, initializeYjsService } from './yjs';


vi.mock('y-socket.io/dist/server', () => {
  const YSocketIO = vi.fn();
  YSocketIO.prototype.initialize = vi.fn();
  return { YSocketIO };
});


const ObjectId = Types.ObjectId;


const getPrivateMdbInstance = (yjsService: IYjsService): MongodbPersistence => {
  // eslint-disable-next-line dot-notation
  return yjsService['mdb'];
};

describe('YjsService', () => {

  describe('hasYdocsNewerThanLatestRevision()', () => {

    beforeAll(async() => {
      const ioMock = mock<Server>();

      // initialize
      initializeYjsService(ioMock);
    });

    afterAll(async() => {
      // flush revisions
      await Revision.deleteMany({});

      // flush yjs-writings
      const yjsService = getYjsService();
      const privateMdb = getPrivateMdbInstance(yjsService);
      await privateMdb.flushDB();
    });

    it('returns false when neither revisions nor YDocs exists', async() => {
      // arrange
      const yjsService = getYjsService();

      const pageId = new ObjectId();

      // act
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns true when no revisions exist', async() => {
      // arrange
      const yjsService = getYjsService();

      const pageId = new ObjectId();

      const privateMdb = getPrivateMdbInstance(yjsService);
      await privateMdb.setMeta(pageId.toString(), 'updatedAt', 1000);

      // act
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(true);
    });

    it('returns false when the latest revision is newer than meta data', async() => {
      // arrange
      const yjsService = getYjsService();

      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      const privateMdb = getPrivateMdbInstance(yjsService);
      await privateMdb.setMeta(pageId.toString(), 'updatedAt', (new Date(2024, 1, 1)).getTime());

      // act
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns false when no YDocs exist', async() => {
      // arrange
      const yjsService = getYjsService();

      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      // act
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(false);
    });

    it('returns true when the newer YDocs exist', async() => {
      // arrange
      const yjsService = getYjsService();

      const pageId = new ObjectId();

      await Revision.insertMany([
        { pageId, body: '' },
      ]);

      const privateMdb = getPrivateMdbInstance(yjsService);
      await privateMdb.setMeta(pageId.toString(), 'updatedAt', (new Date(2034, 1, 1)).getTime());

      // act
      const result = await yjsService.hasYdocsNewerThanLatestRevision(pageId.toString());

      // assert
      expect(result).toBe(true);
    });

  });
});
