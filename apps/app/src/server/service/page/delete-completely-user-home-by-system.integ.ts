import type { IPage, IUser } from '@growi/core';
import mongoose from 'mongoose';
import { vi } from 'vitest';

import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';

import { PageModel } from '../../models/page';

import { deleteCompletelyUserHomeBySystem } from './delete-completely-user-home-by-system';

import PageService from '.';

describe('delete-completely-user-home-by-system test', () => {

  let User;
  let Page;

  const testUser01Name = 'testUser01';
  const testUser02Name = 'testUser02';

  const rootPagePath = '/';
  const userPagePath = '/user';
  const testUser01HomepagePath = `${userPagePath}/${testUser01Name}`;
  const testUser01HomeSubpagePath = `${userPagePath}/${testUser01Name}/subpage`;
  const testUser02HomepagePath = `${userPagePath}/${testUser02Name}`;

  beforeAll(async() => {
    User = mongoose.model<IUser>('User');
    Page = mongoose.model<IPage, PageModel>('Page');

    const rootPageId = new mongoose.Types.ObjectId();
    const userPageId = new mongoose.Types.ObjectId();
    const testUser01HomepageId = new mongoose.Types.ObjectId();

    await User.insertMany([
      {
        name: testUser01Name,
        username: testUser01Name,
        email: `${testUser01Name}@example.com`,
      },
      {
        name: testUser02Name,
        username: testUser02Name,
        email: `${testUser02Name}@example.com`,
      },
    ]);

    await Page.insertMany([
      {
        _id: rootPageId,
        path: rootPagePath,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: null,
      },
      {
        _id: userPageId,
        path: userPagePath,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: rootPageId,
      },
      {
        _id: testUser01HomepageId,
        path: testUser01HomepagePath,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: userPageId,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        path: testUser02HomepagePath,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: userPageId,
      },
      {
        _id: new mongoose.Types.ObjectId(),
        path: testUser01HomeSubpagePath,
        grant: Page.GRANT_PUBLIC,
        isEmpty: true,
        parent: testUser01HomepageId,
      },
    ]);
  });

  afterEach(async() => {
    await User.deleteMany({});
    await Page.deleteMany({});
  });

  describe('deleteCompletelyUserHomeBySystem()', () => {
    const mockUpdateDescendantCountOfAncestors = vi.fn().mockImplementation(
      (pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean): Promise<void> => Promise.resolve(),
    );
    const mockDeleteCompletelyOperation = vi.fn().mockImplementation((pageIds: any, pagePaths: any) => Promise.resolve());
    const mockPageEvent = {
      emit: vi.fn().mockImplementation((event: string, ...args: any[]): void => {}),
    };
    const mockDeleteMultipleCompletely = vi.fn().mockImplementation(
      (pages: any, user: any, options?: any): Promise<void> => Promise.resolve(),
    );

    const mockPageService = {
      updateDescendantCountOfAncestors: mockUpdateDescendantCountOfAncestors,
      deleteCompletelyOperation: mockDeleteCompletelyOperation,
      pageEvent: mockPageEvent,
      deleteMultipleCompletely: mockDeleteMultipleCompletely,
    } as unknown as PageService;

    it('should call page service functions', async() => {
      // when
      await deleteCompletelyUserHomeBySystem(testUser02HomepagePath, mockPageService);

      // then
      expect(mockUpdateDescendantCountOfAncestors).toHaveBeenCalled();
      expect(mockDeleteCompletelyOperation).toHaveBeenCalled();
      expect(mockPageEvent).toHaveBeenCalled();
      expect(mockDeleteMultipleCompletely).toHaveBeenCalled();
    });

    it('should throw error if userHomepage is not exists', async() => {
      // when
      const throwError = async() => {
        await deleteCompletelyUserHomeBySystem('/user/not_exist_user', mockPageService);
      };

      // then
      expect(throwError).toThrowError();
    });
  });
});
