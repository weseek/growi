import type { IAttachment } from '~/interfaces';

import { isPopulated, type Ref } from '../../interfaces/common';

import { serializeUserSecurely, type IUserSerializedSecurely } from './user-serializer';

export type IAttachmentSerializedSecurely = Omit<IAttachment, 'creator'> & { creator?: Ref<IUserSerializedSecurely> };

export const serializeAttachmentSecurely = (attachment?: Ref<IAttachment>): Ref<IAttachmentSerializedSecurely> | undefined => {
  // return when it is not a user object
  if (attachment == null || !isPopulated(attachment)) {
    return attachment;
  }

  // serialize User data
  const { _id, creator, ...restAttachmentProperties } = attachment;

  return {
    _id,
    creator: serializeUserSecurely(creator),
    ...restAttachmentProperties,
  };

};
