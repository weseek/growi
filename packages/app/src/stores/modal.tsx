import { SWRResponse } from 'swr';
import { useStaticSWR } from './use-static-swr';
import { Nullable } from '~/interfaces/common';


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
export type IPageForPageDeleteModal = {
  pageId: string,
  revisionId?: string,
  path: string
}

export type OnDeletedFunction = (pathOrPaths: string | string[], isRecursively: Nullable<true>, isCompletely: Nullable<true>) => void;

type DeleteModalStatus = {
  isOpened: boolean,
  pages?: IPageForPageDeleteModal[],
  onDeleted?: OnDeletedFunction,
  isDeleteCompletelyModal?: boolean,
  isAbleToDeleteCompletely?: boolean,
}

type DeleteModalStatusUtils = {
  open(
    pages?: IPageForPageDeleteModal[],
    onDeleted?: OnDeletedFunction,
    isDeleteCompletelyModal?: boolean,
    isAbleToDeleteCompletely?: boolean,
  ): Promise<DeleteModalStatus | undefined>,
  close(): Promise<DeleteModalStatus | undefined>,
}

export const usePageDeleteModal = (status?: DeleteModalStatus): SWRResponse<DeleteModalStatus, Error> & DeleteModalStatusUtils => {
  const initialData: DeleteModalStatus = {
    isOpened: false,
    pages: [],
    onDeleted: () => {},
    isDeleteCompletelyModal: false,
    isAbleToDeleteCompletely: false,
  };
  const swrResponse = useStaticSWR<DeleteModalStatus, Error>('deleteModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (
        pages?: IPageForPageDeleteModal[],
        onDeleted?: OnDeletedFunction,
        isDeleteCompletelyModal?: boolean,
        isAbleToDeleteCompletely?: boolean,
    ) => swrResponse.mutate({
      isOpened: true, pages, onDeleted, isDeleteCompletelyModal, isAbleToDeleteCompletely,
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

type DuplicateModalStatus = {
  isOpened: boolean,
  pageId?: string,
  path?: string,
}

type DuplicateModalStatusUtils = {
  open(pageId: string, path: string): Promise<DuplicateModalStatus | undefined>
  close(): Promise<DuplicateModalStatus | undefined>
}

export const usePageDuplicateModal = (status?: DuplicateModalStatus): SWRResponse<DuplicateModalStatus, Error> & DuplicateModalStatusUtils => {
  const initialData: DuplicateModalStatus = { isOpened: false, pageId: '', path: '' };
  const swrResponse = useStaticSWR<DuplicateModalStatus, Error>('duplicateModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (pageId: string, path: string) => swrResponse.mutate({ isOpened: true, pageId, path }),
    close: () => swrResponse.mutate({ isOpened: false }),
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

type RenameModalStatus = {
  isOpened: boolean,
  pageId?: string,
  revisionId?: string
  path?: string,
}

type RenameModalStatusUtils = {
  open(pageId: string, revisionId: string, path: string): Promise<RenameModalStatus | undefined>
  close(): Promise<RenameModalStatus | undefined>
}

export const usePageRenameModal = (status?: RenameModalStatus): SWRResponse<RenameModalStatus, Error> & RenameModalStatusUtils => {
  const initialData: RenameModalStatus = {
    isOpened: false, pageId: '', revisionId: '', path: '',
  };
  const swrResponse = useStaticSWR<RenameModalStatus, Error>('renameModalStatus', status, { fallbackData: initialData });

  return {
    ...swrResponse,
    open: (pageId: string, revisionId: string, path: string) => swrResponse.mutate({
      isOpened: true, pageId, revisionId, path,
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
