// see: https://redmine.weseek.co.jp/issues/150649

import { type IRevisionHasId } from '@growi/core';
import mongoose from 'mongoose';

export const convertRevisionPageIdToString = async(): Promise<void> => {
  const Revision = mongoose.model<IRevisionHasId>('Revision');

  // Find pageId fields that are not of type string
  const targetDocuments = await Revision.find({ $expr: { $not: { $eq: [{ $type: '$pageId' }, 'string'] } } });

  const requests = targetDocuments.map((revision) => {
    return {
      updateOne: {
        filter: { _id: revision._id },
        update: {
          $set: {
            pageId: revision.pageId.toString(),
          },
        },
      },
    };
  });

  await Revision.bulkWrite(requests);
};
