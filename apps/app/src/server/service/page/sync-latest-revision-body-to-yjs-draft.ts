import type { IRevisionHasId } from '@growi/core';
import mongoose from 'mongoose';

import { getYjsConnectionManager } from '~/server/service/yjs-connection-manager';

export const syncLatestRevisionBodyToYjsDraft = async(pageId: string): Promise<void> => {
  const yjsConnectionManager = getYjsConnectionManager();
  const Revision = mongoose.model<IRevisionHasId>('Revision');
  const revision = await Revision.findOne({ pageId }).sort({ createdAt: -1 });
  if (revision != null) {
    await yjsConnectionManager.handleYDocUpdate(pageId, revision.body);
  }
};
