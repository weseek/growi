import mongoose from 'mongoose';
import { vi } from 'vitest';

import { deleteCompletelyUserHomeBySystem } from './delete-completely-user-home-by-system';

import PageService from '.';

// TODO: use actual user model after ~/server/models/user.js becomes importable in vitest
// ref: https://github.com/vitest-dev/vitest/issues/846
const userSchema = new mongoose.Schema({
  name: { type: String },
  username: { type: String, required: true, unique: true },
  email: { type: String, unique: true, sparse: true },
}, {
  timestamps: true,
});
const User = mongoose.model('User', userSchema);

describe('delete-completely-user-home-by-system test', () => {
  const userId1 = new mongoose.Types.ObjectId();

  beforeAll(async() => {
    await User.create({
      _id: userId1, name: 'user1', username: 'user1', email: 'user1@example.com',
    });
  });

  describe('deleteCompletelyUserHomeBySystem()', () => {
    // setup
    const mockUpdateDescendantCountOfAncestors = vi.fn().mockImplementation(() => Promise.resolve());
    const mockDeleteCompletelyOperation = vi.fn().mockImplementation(() => Promise.resolve());
    const mockPageEvent = { emit: vi.fn().mockImplementation(() => {}) };
    const mockDeleteMultipleCompletely = vi.fn().mockImplementation(() => Promise.resolve());

    const mockPageService = {
      updateDescendantCountOfAncestors: mockUpdateDescendantCountOfAncestors,
      deleteCompletelyOperation: mockDeleteCompletelyOperation,
      pageEvent: mockPageEvent,
      deleteMultipleCompletely: mockDeleteMultipleCompletely,
    } as unknown as PageService;

    it('should call page service functions', async() => {
      // when
      await deleteCompletelyUserHomeBySystem('/user/user1', mockPageService);

      // then
      expect(mockUpdateDescendantCountOfAncestors).toHaveBeenCalled();
      expect(mockDeleteCompletelyOperation).toHaveBeenCalled();
      expect(mockPageEvent).toHaveBeenCalled();
      expect(mockDeleteMultipleCompletely).toHaveBeenCalled();
    });

    it('should throw error if userHomepage is not exists', async() => {
      // when
      const throwError = async() => {
        await deleteCompletelyUserHomeBySystem('/user/not_exists_user', mockPageService);
      };

      // then
      expect(throwError).toThrowError();
    });
  });
});
