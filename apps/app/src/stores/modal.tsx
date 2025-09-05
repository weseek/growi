import { useCallback } from 'react';

import type {
  IAttachmentHasId, IUserGroupHasId,
} from '@growi/core';
import { useSWRStatic } from '@growi/core/dist/swr';
import type { SWRResponse } from 'swr';

import type { BookmarkFolderItems } from '~/interfaces/bookmark-info';
import type {
  onDeletedBookmarkFolderFunction,
} from '~/interfaces/ui';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:stores:modal');


/*
 * UpdateUserGroupConfirmModal
 */
type UpdateUserGroupConfirmModalStatus = {
  isOpened: boolean,
  targetGroup?: IUserGroupHasId,
  updateData?: Partial<IUserGroupHasId>,
  onConfirm?: (targetGroup: IUserGroupHasId, updateData: Partial<IUserGroupHasId>, forceUpdateParents: boolean) => any,
}

type UpdateUserGroupConfirmModalUtils = {
  open(targetGroup: IUserGroupHasId, updateData: Partial<IUserGroupHasId>, onConfirm?: (...args: any[]) => any): Promise<void>,
  close(): Promise<void>,
}

export const useUpdateUserGroupConfirmModal = (): SWRResponse<UpdateUserGroupConfirmModalStatus, Error> & UpdateUserGroupConfirmModalUtils => {

  const initialStatus: UpdateUserGroupConfirmModalStatus = { isOpened: false };
  const swrResponse = useSWRStatic<UpdateUserGroupConfirmModalStatus, Error>('updateParentConfirmModal', undefined, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    async open(targetGroup: IUserGroupHasId, updateData: Partial<IUserGroupHasId>, onConfirm?: (...args: any[]) => any) {
      await swrResponse.mutate({
        isOpened: true, targetGroup, updateData, onConfirm,
      });
    },
    async close() {
      await swrResponse.mutate({ isOpened: false });
    },
  };
};


/*
* BookmarkFolderDeleteModal
*/
export type IDeleteBookmarkFolderModalOption = {
  onDeleted?: onDeletedBookmarkFolderFunction,
}

type DeleteBookmarkFolderModalStatus = {
  isOpened: boolean,
  bookmarkFolder?: BookmarkFolderItems,
  opts?: IDeleteBookmarkFolderModalOption,
}

type DeleteModalBookmarkFolderStatusUtils = {
  open(
    bookmarkFolder?: BookmarkFolderItems,
    opts?: IDeleteBookmarkFolderModalOption,
  ): Promise<DeleteBookmarkFolderModalStatus | undefined>,
  close(): Promise<DeleteBookmarkFolderModalStatus | undefined>,
}

export const useBookmarkFolderDeleteModal = (status?: DeleteBookmarkFolderModalStatus):
  SWRResponse<DeleteBookmarkFolderModalStatus, Error> & DeleteModalBookmarkFolderStatusUtils => {
  const initialData: DeleteBookmarkFolderModalStatus = {
    isOpened: false,
  };
  const swrResponse = useSWRStatic<DeleteBookmarkFolderModalStatus, Error>('deleteBookmarkFolderModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        bookmarkFolder?: BookmarkFolderItems,
        opts?: IDeleteBookmarkFolderModalOption,
    ) => swrResponse.mutate({
      isOpened: true, bookmarkFolder, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

/**
 * DeleteAttachmentModal
 */
type Remove =
  (body: {
    attachment_id: string;
  }) => Promise<void>

type DeleteAttachmentModalStatus = {
  isOpened: boolean,
  attachment?: IAttachmentHasId,
  remove?: Remove,
}

type DeleteAttachmentModalUtils = {
  open(
    attachment: IAttachmentHasId,
    remove: Remove,
  ): void,
  close(): void,
}

export const useDeleteAttachmentModal = (): SWRResponse<DeleteAttachmentModalStatus, Error> & DeleteAttachmentModalUtils => {
  const initialStatus: DeleteAttachmentModalStatus = {
    isOpened: false,
    attachment: undefined,
    remove: undefined,
  };
  const swrResponse = useSWRStatic<DeleteAttachmentModalStatus, Error>('deleteAttachmentModal', undefined, { fallbackData: initialStatus });
  const { mutate } = swrResponse;

  const open = useCallback((attachment: IAttachmentHasId, remove: Remove) => {
    mutate({ isOpened: true, attachment, remove });
  }, [mutate]);
  const close = useCallback(() => {
    mutate({ isOpened: false });
  }, [mutate]);

  return {
    ...swrResponse,
    open,
    close,
  };
};

/*
* OverwriteMergeModeModal
*/
