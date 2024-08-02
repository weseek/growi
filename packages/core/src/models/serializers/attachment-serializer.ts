import type { IAttachment } from '~/interfaces';

import { isPopulated, isRef, type Ref } from '../../interfaces/common';

import { serializeUserSecurely, type IUserSerializedSecurely } from './user-serializer';

export type IAttachmentSerializedSecurely<A extends IAttachment = IAttachment> = Omit<A, 'creator'> & { creator?: Ref<IUserSerializedSecurely> };

const omitInsecureAttributes = <A extends IAttachment>(attachment: A): IAttachmentSerializedSecurely<A> => {
  const { creator, ...rest } = attachment;

  const secureCreator = creator == null
    ? undefined
    : serializeUserSecurely(creator);

  return {
    creator: secureCreator,
    ...rest,
  };
};


export function serializeAttachmentSecurely<A extends IAttachment>(attachment?: A): IAttachmentSerializedSecurely<A>;
export function serializeAttachmentSecurely<A extends IAttachment>(attachment?: Ref<A>): Ref<IAttachmentSerializedSecurely<A>>;
export function serializeAttachmentSecurely<A extends IAttachment>(attachment?: A | Ref<A>)
    : undefined | IAttachmentSerializedSecurely<A> | Ref<IAttachmentSerializedSecurely<A>> {

  if (attachment == null) return attachment;

  if (isRef(attachment) && !isPopulated(attachment)) return attachment;

  return omitInsecureAttributes(attachment);
}
