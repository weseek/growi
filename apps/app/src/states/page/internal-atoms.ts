import type { IPagePopulatedToShowRevision, Nullable, IUserHasId } from '@growi/core';
import { pagePathUtils } from '@growi/core/dist/utils';
import { atom } from 'jotai';

/**
 * Internal atoms for page state management
 * These should not be imported directly by external modules
 */

// Core page state atoms (internal)
export const currentPageIdAtom = atom<Nullable<string>>(null);
export const currentPageDataAtom = atom<IPagePopulatedToShowRevision | null>(null);
export const pageNotFoundAtom = atom(false);
export const latestRevisionAtom = atom(true);

// Template data atoms (internal)
export const templateTagsAtom = atom<string[]>([]);
export const templateContentAtom = atom<string>('');

// Derived atoms for computed states
export const currentPagePathAtom = atom((get) => {
  const currentPage = get(currentPageDataAtom);
  return currentPage?.path ?? null;
});

// Additional computed atoms for migrated hooks
export const currentRevisionIdAtom = atom((get) => {
  const currentPage = get(currentPageDataAtom);
  return currentPage?.revision?._id ?? null;
});

// Remote revision data atoms (migrated from useSWRStatic)
export const remoteRevisionIdAtom = atom<string | null>(null);
export const remoteRevisionBodyAtom = atom<string | null>(null);
export const remoteRevisionLastUpdateUserAtom = atom<IUserHasId | null>(null);
export const remoteRevisionLastUpdatedAtAtom = atom<Date | null>(null);

// Enhanced computed atoms that replace SWR-based hooks
export const isTrashPageAtom = atom((get) => {
  const pagePath = get(currentPagePathAtom);
  return pagePath != null ? pagePathUtils.isTrashPage(pagePath) : false;
});

export const isRevisionOutdatedAtom = atom((get) => {
  const currentRevisionId = get(currentRevisionIdAtom);
  const remoteRevisionId = get(remoteRevisionIdAtom);

  if (currentRevisionId == null || remoteRevisionId == null) {
    return false;
  }

  return remoteRevisionId !== currentRevisionId;
});

// Action atoms for state updates
export const setCurrentPageAtom = atom(
  null,
  (get, set, page: IPagePopulatedToShowRevision | null) => {
    set(currentPageDataAtom, page);
    if (page?._id) {
      set(currentPageIdAtom, page._id);
    }
  },
);

export const setPageStatusAtom = atom(
  null,
  (get, set, status: { isNotFound?: boolean; isLatestRevision?: boolean }) => {
    if (status.isNotFound !== undefined) {
      set(pageNotFoundAtom, status.isNotFound);
    }
    if (status.isLatestRevision !== undefined) {
      set(latestRevisionAtom, status.isLatestRevision);
    }
  },
);

// Update atoms for template and remote revision data
export const setTemplateDataAtom = atom(
  null,
  (get, set, data: { tags?: string[]; body?: string }) => {
    if (data.tags !== undefined) {
      set(templateTagsAtom, data.tags);
    }
    if (data.body !== undefined) {
      set(templateContentAtom, data.body);
    }
  },
);

export const setRemoteRevisionDataAtom = atom(
  null,
  (get, set, data: {
    id?: string | null;
    body?: string | null;
    lastUpdateUser?: IUserHasId | null;
    lastUpdatedAt?: Date | null;
  }) => {
    if (data.id !== undefined) {
      set(remoteRevisionIdAtom, data.id);
    }
    if (data.body !== undefined) {
      set(remoteRevisionBodyAtom, data.body);
    }
    if (data.lastUpdateUser !== undefined) {
      set(remoteRevisionLastUpdateUserAtom, data.lastUpdateUser);
    }
    if (data.lastUpdatedAt !== undefined) {
      set(remoteRevisionLastUpdatedAtAtom, data.lastUpdatedAt);
    }
  },
);
