import type { IPageHasId, IUserHasId } from '@growi/core';

import PageEvent from '~/server/events/page';
import loggerFactory from '~/utils/logger';

import { deleteCompletelyOperation } from './delete-completely-operation';

const logger = loggerFactory('growi:services:page');

// delete multiple pages
export const deleteMultipleCompletely = async(pages: IPageHasId[], user?: IUserHasId, _options = {}): Promise<void> => {
  // TODO: Remove from crowi dependence
  // const pageEvent = new PageEvent();

  const ids = pages.map(page => (page._id));
  const paths = pages.map(page => (page.path));

  logger.debug('Deleting completely', paths);

  await deleteCompletelyOperation(ids, paths);

  // TODO: Remove from crowi dependence
  // pageEvent.emit('syncDescendantsDelete', pages, user); // update as renamed page
};
