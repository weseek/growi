import {
  type IRevision, type Ref, getIdForRef, isPopulated,
} from '@growi/core';
import mongoose from 'mongoose';

import loggerFactory from '~/utils/logger';

import { AddInlineComment } from '../../../interfaces';

const logger = loggerFactory('growi:comment:services:addInlineComment');

export const addInlineComment = async(revision: Ref<IRevision>, params: AddInlineComment): Promise<InlineCommentRelationDocument | void> => {
  const Revision = mongoose.model<IRevision>('Revision');

  const revisionDoc = isPopulated(revision)
    ? revision
    : await Revision.findOne({ _id: revision });

  if (revisionDoc == null) {
    logger.warn(`The revision ('${getIdForRef(revision)}') is not found.`);
    return;
  }

  // create / merge patch
  // original revision -> marked revision

  // throw error if invalid

  // add comment

  // save inline comment relation

  return;
};
