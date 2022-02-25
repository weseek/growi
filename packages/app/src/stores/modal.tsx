import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { OnDuplicatedFunction, OnRenamedFunction, OnDeletedFunction } from '~/interfaces/ui';
import {
  IPageInfoAll, IPageToDeleteWithMeta, IPageWithMeta,
} from '~/interfaces/page';
import { IPageSearchMeta } from '~/interfaces/search';


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
// export type IPageForPageDeleteModal = {
//   pageId: string,
//   revisionId?: string,
//   path: string
//   isAbleToDeleteCompletely?: boolean,
// }

export type IDeleteModalOption = {
  onDeleted?: OnDeletedFunction,
}

type DeleteModalStatus = {
  isOpened: boolean,
  pages?: (IPageWithMeta<IPageInfoAll | IPageSearchMeta> | IPageToDeleteWithMeta)[],
  opts?: IDeleteModalOption,
}

type DeleteModalStatusUtils = {
  open(
    pages?: (IPageWithMeta<IPageInfoAll | IPageSearchMeta> | IPageToDeleteWithMeta)[],
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
        pages?: (IPageWithMeta<IPageInfoAll | IPageSearchMeta> | IPageToDeleteWithMeta)[],
        opts?: IDeleteModalOption,
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
  const initialData: DuplicateModalStatus = { isOpened: false, page: { pageId: '', path: '/' } };
  const swrResponse = useStaticSWR<DuplicateModalStatus, Error>('duplicateModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        page?: IPageForPageDuplicateModal,
        opts?: IDuplicateModalOption,
    ) => swrResponse.mutate({ isOpened: true, page, opts }),
    close: () => swrResponse.mutate({ isOpened: false, page: { pageId: '', path: '/' } }),
  };
};


/*
* PageRenameModal
*/
export type IPageForPageRenameModal = {
  pageId: string,
  revisionId: string,
  path: string
}

export type IRenameModalOption = {
  onRenamed?: OnRenamedFunction,
}

type RenameModalStatus = {
  isOpened: boolean,
  page?: IPageForPageRenameModal,
  opts?: IRenameModalOption
}

type RenameModalStatusUtils = {
  open(
    page?: IPageForPageRenameModal,
    opts?: IRenameModalOption
    ): Promise<RenameModalStatus | undefined>
  close(): Promise<RenameModalStatus | undefined>
}

export const usePageRenameModal = (status?: RenameModalStatus): SWRResponse<RenameModalStatus, Error> & RenameModalStatusUtils => {
  const initialData: RenameModalStatus = {
    isOpened: false, page: { pageId: '', revisionId: '', path: '' },
  };
  const swrResponse = useStaticSWR<RenameModalStatus, Error>('renameModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        page?: IPageForPageRenameModal,
        opts?: IRenameModalOption,
    ) => swrResponse.mutate({
      isOpened: true, page, opts,
    }),
    close: () => swrResponse.mutate({ isOpened: false, page: { pageId: '', revisionId: '', path: '' } }),
  };
};


/*
* PutBackPageModal
*/
type PutBackPageModalStatus = {
  isOpened: boolean,
  pageId?: string,
  path?: string,
}

type PutBackPageModalUtils = {
  open(pageId: string, path: string): Promise<PutBackPageModalStatus | undefined>
  close():Promise<PutBackPageModalStatus | undefined>
}

export const usePutBackPageModal = (status?: PutBackPageModalStatus): SWRResponse<PutBackPageModalStatus, Error> & PutBackPageModalUtils => {
  const initialData = { isOpened: false, pageId: '', path: '' };
  const swrResponse = useStaticSWR<PutBackPageModalStatus, Error>('putBackPageModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (pageId: string, path: string) => swrResponse.mutate({
      isOpened: true, pageId, path,
    }),
    close: () => swrResponse.mutate({ isOpened: false }),
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
 * LegacyPrivatePagesMigrationModal
 */

export type ILegacyPrivatePage = { pageId: string, path: string };

export type LegacyPrivatePagesMigrationModalSubmitedHandler = (pages: ILegacyPrivatePage[], isRecursively?: boolean) => void;

type LegacyPrivatePagesMigrationModalStatus = {
  isOpened: boolean,
  pages?: ILegacyPrivatePage[],
  onSubmited?: LegacyPrivatePagesMigrationModalSubmitedHandler,
}

type LegacyPrivatePagesMigrationModalStatusUtils = {
  open(pages: ILegacyPrivatePage[], onSubmited?: LegacyPrivatePagesMigrationModalSubmitedHandler): Promise<LegacyPrivatePagesMigrationModalStatus | undefined>,
  close(): Promise<LegacyPrivatePagesMigrationModalStatus | undefined>,
}

export const useLegacyPrivatePagesMigrationModal = (
    status?: LegacyPrivatePagesMigrationModalStatus,
): SWRResponse<LegacyPrivatePagesMigrationModalStatus, Error> & LegacyPrivatePagesMigrationModalStatusUtils => {
  const initialData: LegacyPrivatePagesMigrationModalStatus = {
    isOpened: false,
    pages: [],
  };
  const swrResponse = useStaticSWR<LegacyPrivatePagesMigrationModalStatus, Error>('legacyPrivatePagesMigrationModal', status, { fallbackData: initialData });

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
