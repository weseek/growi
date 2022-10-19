import { SWRResponse } from 'swr';

import { IPageToDeleteWithMeta, IPageToRenameWithMeta } from '~/interfaces/page';
import {
  OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction, OnPutBackedFunction,
} from '~/interfaces/ui';
import { IUserGroupHasId } from '~/interfaces/user';

import { useStaticSWR } from './use-static-swr';


/*
* PageCreateModal
*/
type CreateModalStatus = {
  isOpened: boolean,
  path?: string,
}

type CreateModalStatusUtils = {
  open(path?: string): Promise<CreateModalStatus | undefined>
  close(): Promise<CreateModalStatus | undefined>
}

export const usePageCreateModal = (status?: CreateModalStatus): SWRResponse<CreateModalStatus, Error> & CreateModalStatusUtils => {
  const initialData: CreateModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<CreateModalStatus, Error>('pageCreateModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (path?: string) => swrResponse.mutate({ isOpened: true, path }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

/*
* PageDeleteModal
*/
export type IDeleteModalOption = {
  onDeleted?: OnDeletedFunction,
}

type DeleteModalStatus = {
  isOpened: boolean,
  pages?: IPageToDeleteWithMeta[],
  opts?: IDeleteModalOption,
}

type DeleteModalStatusUtils = {
  open(
    pages?: IPageToDeleteWithMeta[],
    opts?: IDeleteModalOption,
  ): Promise<DeleteModalStatus | undefined>,
  close(): Promise<DeleteModalStatus | undefined>,
}

export const usePageDeleteModal = (status?: DeleteModalStatus): SWRResponse<DeleteModalStatus, Error> & DeleteModalStatusUtils => {
  const initialData: DeleteModalStatus = {
    isOpened: false,
    pages: [],
  };
  const swrResponse = useStaticSWR<DeleteModalStatus, Error>('deleteModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        pages?: IPageToDeleteWithMeta[],
        opts?: IDeleteModalOption,
    ) => swrResponse.mutate({
      isOpened: true, pages, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

/*
* EmptyTrashModal
*/
type IEmptyTrashModalOption = {
  onEmptiedTrash?: () => void,
  canDelepeAllPages: boolean,
}

type EmptyTrashModalStatus = {
  isOpened: boolean,
  pages?: IPageToDeleteWithMeta[],
  opts?: IEmptyTrashModalOption,
}

type EmptyTrashModalStatusUtils = {
  open(
    pages?: IPageToDeleteWithMeta[],
    opts?: IEmptyTrashModalOption,
  ): Promise<EmptyTrashModalStatus | undefined>,
  close(): Promise<EmptyTrashModalStatus | undefined>,
}

export const useEmptyTrashModal = (status?: EmptyTrashModalStatus): SWRResponse<EmptyTrashModalStatus, Error> & EmptyTrashModalStatusUtils => {
  const initialData: EmptyTrashModalStatus = {
    isOpened: false,
    pages: [],
  };
  const swrResponse = useStaticSWR<EmptyTrashModalStatus, Error>('emptyTrashModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        pages?: IPageToDeleteWithMeta[],
        opts?: IEmptyTrashModalOption,
    ) => swrResponse.mutate({
      isOpened: true, pages, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

/*
* PageDuplicateModal
*/
export type IPageForPageDuplicateModal = {
  pageId: string,
  path: string
}

export type IDuplicateModalOption = {
  onDuplicated?: OnDuplicatedFunction,
}

type DuplicateModalStatus = {
  isOpened: boolean,
  page?: IPageForPageDuplicateModal,
  opts?: IDuplicateModalOption,
}

type DuplicateModalStatusUtils = {
  open(
    page?: IPageForPageDuplicateModal,
    opts?: IDuplicateModalOption
  ): Promise<DuplicateModalStatus | undefined>
  close(): Promise<DuplicateModalStatus | undefined>
}

export const usePageDuplicateModal = (status?: DuplicateModalStatus): SWRResponse<DuplicateModalStatus, Error> & DuplicateModalStatusUtils => {
  const initialData: DuplicateModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<DuplicateModalStatus, Error>('duplicateModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        page?: IPageForPageDuplicateModal,
        opts?: IDuplicateModalOption,
    ) => swrResponse.mutate({ isOpened: true, page, opts }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};


/*
 * PageRenameModal
 */
export type IRenameModalOption = {
  onRenamed?: OnRenamedFunction,
}

type RenameModalStatus = {
  isOpened: boolean,
  page?: IPageToRenameWithMeta,
  opts?: IRenameModalOption
}

type RenameModalStatusUtils = {
  open(
    page?: IPageToRenameWithMeta,
    opts?: IRenameModalOption
    ): Promise<RenameModalStatus | undefined>
  close(): Promise<RenameModalStatus | undefined>
}

export const usePageRenameModal = (status?: RenameModalStatus): SWRResponse<RenameModalStatus, Error> & RenameModalStatusUtils => {
  const initialData: RenameModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<RenameModalStatus, Error>('renameModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        page?: IPageToRenameWithMeta,
        opts?: IRenameModalOption,
    ) => swrResponse.mutate({
      isOpened: true, page, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};


/*
* PutBackPageModal
*/
export type IPageForPagePutBackModal = {
  pageId: string,
  path: string
}

export type IPutBackPageModalOption = {
  onPutBacked?: OnPutBackedFunction,
}

type PutBackPageModalStatus = {
  isOpened: boolean,
  page?: IPageForPagePutBackModal,
  opts?: IPutBackPageModalOption,
}

type PutBackPageModalUtils = {
  open(
    page?: IPageForPagePutBackModal,
    opts?: IPutBackPageModalOption,
    ): Promise<PutBackPageModalStatus | undefined>
  close():Promise<PutBackPageModalStatus | undefined>
}

export const usePutBackPageModal = (status?: PutBackPageModalStatus): SWRResponse<PutBackPageModalStatus, Error> & PutBackPageModalUtils => {
  const initialData: PutBackPageModalStatus = {
    isOpened: false,
    page: { pageId: '', path: '' },
  };
  const swrResponse = useStaticSWR<PutBackPageModalStatus, Error>('putBackPageModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        page: IPageForPagePutBackModal, opts?: IPutBackPageModalOption,
    ) => swrResponse.mutate({
      isOpened: true, page, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false, page: { pageId: '', path: '' } }),
  };
};


/*
* PagePresentationModal
*/
type PresentationModalStatus = {
  isOpened: boolean,
  href?: string
}

type PresentationModalStatusUtils = {
  open(href: string): Promise<PresentationModalStatus | undefined>
  close(): Promise<PresentationModalStatus | undefined>
}

export const usePagePresentationModal = (
    status?: PresentationModalStatus,
): SWRResponse<PresentationModalStatus, Error> & PresentationModalStatusUtils => {
  const initialData: PresentationModalStatus = {
    isOpened: false, href: '?presentation=1',
  };
  const swrResponse = useStaticSWR<PresentationModalStatus, Error>('presentationModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (href: string) => swrResponse.mutate({ isOpened: true, href }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};


/*
 * PrivateLegacyPagesMigrationModal
 */

export type ILegacyPrivatePage = { pageId: string, path: string };

export type PrivateLegacyPagesMigrationModalSubmitedHandler = (pages: ILegacyPrivatePage[], isRecursively?: boolean) => void;

type PrivateLegacyPagesMigrationModalStatus = {
  isOpened: boolean,
  pages?: ILegacyPrivatePage[],
  onSubmited?: PrivateLegacyPagesMigrationModalSubmitedHandler,
}

type PrivateLegacyPagesMigrationModalStatusUtils = {
  open(pages: ILegacyPrivatePage[], onSubmited?: PrivateLegacyPagesMigrationModalSubmitedHandler): Promise<PrivateLegacyPagesMigrationModalStatus | undefined>,
  close(): Promise<PrivateLegacyPagesMigrationModalStatus | undefined>,
}

export const usePrivateLegacyPagesMigrationModal = (
    status?: PrivateLegacyPagesMigrationModalStatus,
): SWRResponse<PrivateLegacyPagesMigrationModalStatus, Error> & PrivateLegacyPagesMigrationModalStatusUtils => {
  const initialData: PrivateLegacyPagesMigrationModalStatus = {
    isOpened: false,
    pages: [],
  };
  const swrResponse = useStaticSWR<PrivateLegacyPagesMigrationModalStatus, Error>('privateLegacyPagesMigrationModal', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (pages, onSubmited?) => swrResponse.mutate({
      isOpened: true, pages, onSubmited,
    }),
    close: () => swrResponse.mutate({ isOpened: false, pages: [], onSubmited: undefined }),
  };
};


/*
* DescendantsPageListModal
*/
type DescendantsPageListModalStatus = {
  isOpened: boolean,
  path?: string,
}

type DescendantsPageListUtils = {
  open(path: string): Promise<DescendantsPageListModalStatus | undefined>
  close(): Promise<DuplicateModalStatus | undefined>
}

export const useDescendantsPageListModal = (
    status?: DescendantsPageListModalStatus,
): SWRResponse<DescendantsPageListModalStatus, Error> & DescendantsPageListUtils => {

  const initialData: DescendantsPageListModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<DescendantsPageListModalStatus, Error>('descendantsPageListModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (path: string) => swrResponse.mutate({ isOpened: true, path }),
    close: () => swrResponse.mutate({ isOpened: false }),
  };
};

/*
* PageAccessoriesModal
*/
export const PageAccessoriesModalContents = {
  PageHistory: 'PageHistory',
  Attachment: 'Attachment',
  ShareLink: 'ShareLink',
} as const;
export type PageAccessoriesModalContents = typeof PageAccessoriesModalContents[keyof typeof PageAccessoriesModalContents];

type PageAccessoriesModalStatus = {
  isOpened: boolean,
  onOpened?: (initialActivatedContents: PageAccessoriesModalContents) => void,
}

type PageAccessoriesModalUtils = {
  open(activatedContents: PageAccessoriesModalContents): void
  close(): void
}

export const usePageAccessoriesModal = (): SWRResponse<PageAccessoriesModalStatus, Error> & PageAccessoriesModalUtils => {

  const initialStatus = { isOpened: false };
  const swrResponse = useStaticSWR<PageAccessoriesModalStatus, Error>('pageAccessoriesModalStatus', undefined, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open: (activatedContents: PageAccessoriesModalContents) => {
      if (swrResponse.data == null) {
        return;
      }
      swrResponse.mutate({ isOpened: true });

      if (swrResponse.data.onOpened != null) {
        swrResponse.data.onOpened(activatedContents);
      }
    },
    close: () => {
      if (swrResponse.data == null) {
        return;
      }
      swrResponse.mutate({ isOpened: false });
    },
  };
};

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
  const swrResponse = useStaticSWR<UpdateUserGroupConfirmModalStatus, Error>('updateParentConfirmModal', undefined, { fallbackData: initialStatus });

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
 * ShortcutsModal
 */
type ShortcutsModalStatus = {
  isOpened: boolean,
}

type ShortcutsModalUtils = {
  open(): void,
  close(): void,
}

export const useShortcutsModal = (): SWRResponse<ShortcutsModalStatus, Error> & ShortcutsModalUtils => {

  const initialStatus: ShortcutsModalStatus = { isOpened: false };
  const swrResponse = useStaticSWR<ShortcutsModalStatus, Error>('shortcutsModal', undefined, { fallbackData: initialStatus });

  return {
    ...swrResponse,
    open() {
      swrResponse.mutate({ isOpened: true });
    },
    close() {
      swrResponse.mutate({ isOpened: false });
    },
  };
};


/*
* DrawioModal
*/

type DrawioModalStatus = {
  isOpened: boolean,
  drawioMxFile: string,
}

type DrawioModalStatusUtils = {
  open(drawioMxFile: string): void,
  close(): void,
}

export const useDrawioModal = (status?: DrawioModalStatus): SWRResponse<DrawioModalStatus, Error> & DrawioModalStatusUtils => {
  const initialData: DrawioModalStatus = {
    isOpened: false,
    drawioMxFile: '',
  };
  const swrResponse = useStaticSWR<DrawioModalStatus, Error>('drawioModalStatus', status, { fallbackData: initialData });

  const close = (): void => {
    swrResponse.mutate({ isOpened: false, drawioMxFile: '' });
  };

  const open = (drawioMxFile: string): void => {
    swrResponse.mutate({ isOpened: true, drawioMxFile });
  };

  return {
    ...swrResponse,
    open,
    close,
  };
};
