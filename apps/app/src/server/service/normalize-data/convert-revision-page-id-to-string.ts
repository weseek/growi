// see: https://redmine.weseek.co.jp/issues/150649

import { type IRevisionHasId } from '@growi/core';
import mongoose from 'mongoose';

import { type IRevisionModel } from '~/server/models/revision';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:service:NormalizeData:convert-revision-page-id-to-string');

export const convertRevisionPageIdToString = async(): Promise<void> => {
  const Revision = mongoose.model<IRevisionHasId, IRevisionModel>('Revision');

  const filter = { pageId: { $type: 'objectId' } };  
  const update = [
    {
      $set: {
        pageId: {
          $toString: '$pageId',
        },
      },
    },
  ];

  await Revision.updateMany(filter, update);

  const explain = await Revision.updateMany(filter, update).explain('queryPlanner');
  logger.debug(explain);
};
