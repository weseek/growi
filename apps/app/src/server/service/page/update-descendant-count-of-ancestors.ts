import type { IPageHasId } from '@growi/core';
import mongoose from 'mongoose';

import { UpdateDescCountRawData, SocketEventName } from '~/interfaces/websocket';
import { ObjectIdLike } from '~/server/interfaces/mongoose-utils';
import type { PageModel } from '~/server/models/page';

// import { socketIoService } from '../socket-io';

// const emitUpdateDescCount = (data: UpdateDescCountRawData): void => {
//   const socket = socketIoService.getDefaultSocket();

//   socket.emit(SocketEventName.UpdateDescCount, data);
// };

// update descendantCount of all pages that are ancestors of a provided pageId by count
export const updateDescendantCountOfAncestors = async(pageId: ObjectIdLike, inc: number, shouldIncludeTarget: boolean): Promise<void> => {
  const Page = mongoose.model<IPageHasId, PageModel>('Page');
  const ancestors: IPageHasId[] = await Page.findAncestorsUsingParentRecursively(pageId, shouldIncludeTarget);
  const ancestorPageIds = ancestors.map(p => p._id);

  await Page.incrementDescendantCountOfPageIds(ancestorPageIds, inc);

  const updateDescCountData: UpdateDescCountRawData = Object.fromEntries(ancestors.map(p => [p._id.toString(), p.descendantCount + inc]));
  // TODO: Remove from crowi dependence
  // emitUpdateDescCount(updateDescCountData);
};
