import { Writable } from 'stream';

import { getIdForRef } from '@growi/core';
import type { IPage } from '@growi/core';
import { isUsersHomepage } from '@growi/core/dist/utils/page-path-utils';
import mongoose from 'mongoose';
import streamToPromise from 'stream-to-promise';

import PageEvent from '~/server/events/page';
import type { PageModel } from '~/server/models/page';
import { createBatchStream } from '~/server/util/batch-stream';
import loggerFactory from '~/utils/logger';

import { deleteCompletelyOperation } from './delete-completely-operation';
import { deleteMultipleCompletely } from './delete-multiple-completely';
import { BULK_REINDEX_SIZE } from './page';
import { shouldUseV4Process } from './should-use-v4-process';
import { updateDescendantCountOfAncestors } from './update-descendant-count-of-ancestors';


const logger = loggerFactory('growi:services:page');

/**
   * @description This function is intended to be used exclusively for forcibly deleting the user homepage by the system.
   * It should only be called from within the appropriate context and with caution as it performs a system-level operation.
   *
   * @param {string} userHomepagePath - The path of the user's homepage.
   * @returns {Promise<void>} - A Promise that resolves when the deletion is complete.
   * @throws {Error} - If an error occurs during the deletion process.
   */
export const deleteCompletelyUserHomeBySystem = async(userHomepagePath: string): Promise<void> => {
  if (!isUsersHomepage(userHomepagePath)) {
    const msg = 'input value is not user homepage path.';
    logger.error(msg);
    throw new Error(msg);
  }

  const Page = mongoose.model<IPage, PageModel>('Page');
  const userHomepage = await Page.findByPath(userHomepagePath, true);

  if (userHomepage == null) {
    const msg = 'user homepage is not found.';
    logger.error(msg);
    throw new Error(msg);
  }

  const isShouldUseV4Process = shouldUseV4Process(userHomepage);

  const ids = [userHomepage._id];
  const paths = [userHomepage.path];
  const parentId = getIdForRef(userHomepage.parent);

  try {
    if (!isShouldUseV4Process) {
      // Ensure consistency of ancestors
      const inc = userHomepage.isEmpty ? -userHomepage.descendantCount : -(userHomepage.descendantCount + 1);
      await updateDescendantCountOfAncestors(parentId, inc, true);
    }

    // Delete the user's homepage
    await deleteCompletelyOperation(ids, paths);

    if (!isShouldUseV4Process) {
      // Remove leaf empty pages
      await Page.removeLeafEmptyPagesRecursively(parentId);
    }

    if (!userHomepage.isEmpty) {
      // TODO: Remove from crowi dependence
      // const pageEvent = new PageEvent();
      // // Emit an event for the search service
      // pageEvent.emit('deleteCompletely', userHomepage);
    }

    const { PageQueryBuilder } = Page;

    // Find descendant pages with system deletion condition
    const builder = new PageQueryBuilder(Page.find(), true)
      .addConditionForSystemDeletion()
      .addConditionToListOnlyDescendants(userHomepage.path, {});

    // Stream processing to delete descendant pages
    // ────────┤ start │─────────
    const readStream = await builder
      .query
      .lean()
      .cursor({ batchSize: BULK_REINDEX_SIZE });

    let count = 0;

    const writeStream = new Writable({
      objectMode: true,
      async write(batch, encoding, callback) {
        try {
          count += batch.length;
          // Delete multiple pages completely
          await deleteMultipleCompletely(batch, undefined, {});
          logger.debug(`Adding pages progressing: (count=${count})`);
        }
        catch (err) {
          logger.error('addAllPages error on add anyway: ', err);
        }
        callback();
      },
      final(callback) {
        logger.debug(`Adding pages has completed: (totalCount=${count})`);
        callback();
      },
    });

    readStream
      .pipe(createBatchStream(BULK_REINDEX_SIZE))
      .pipe(writeStream);

    await streamToPromise(writeStream);
    // ────────┤ end │─────────
  }
  catch (err) {
    logger.error('Error occurred while deleting user homepage and subpages.', err);
    throw err;
  }
};
