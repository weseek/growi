// see: https://redmine.weseek.co.jp/issues/150649

import { type IRevisionHasId } from '@growi/core';
import mongoose from 'mongoose';

import { type IRevisionModel } from '~/server/models/revision';

export const convertRevisionPageIdToString = async(): Promise<void> => {
  const Revision = mongoose.model<IRevisionHasId, IRevisionModel>('Revision');

  // Find and update pageId fields that are not of type string
  await Revision.updateMany(
    { $expr: { $not: { $eq: [{ $type: '$pageId' }, 'string'] } } },
    [
      {
        $set: {
          pageId: {
            $toString: '$pageId',
          },
        },
      },
    ],
  );
};
