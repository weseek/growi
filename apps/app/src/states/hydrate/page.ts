import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useHydrateAtoms } from 'jotai/utils';

import {
  currentPageIdAtom,
  currentPageDataAtom,
  pageNotFoundAtom,
  latestRevisionAtom,
  templateTagsAtom,
  templateContentAtom,
  remoteRevisionIdAtom,
  remoteRevisionBodyAtom,
} from '../page/internal-atoms';

/**
 * Hook for hydrating page-related atoms with server-side data
 * Simplified to focus on the most common use case: hydrating with page data
 *
 * This replaces the complex shouldMutate logic in useSWRxCurrentPage
 * with simple, direct atom initialization
 *
 * Data sources:
 * - page._id, page.revision -> Auto-extracted from IPagePopulatedToShowRevision
 * - remoteRevisionId, remoteRevisionBody -> Auto-extracted from page.revision
 * - templateTags, templateBody, isLatestRevision -> Explicitly provided via options
 *
 * @example
 * // Basic usage
 * useHydratePageAtoms(pageWithMeta?.data ?? null);
 *
 * // With template data and custom flags
 * useHydratePageAtoms(pageWithMeta?.data ?? null, {
 *   isLatestRevision: false,
 *   templateTags: ['tag1', 'tag2'],
 *   templateBody: 'Template content'
 * });
 */
export const useHydratePageAtoms = (
    page: IPagePopulatedToShowRevision | null,
    options?: {
      isNotFound?: boolean;
      isLatestRevision?: boolean;
      templateTags?: string[];
      templateBody?: string;
    },
): void => {
  useHydrateAtoms([
    // Core page state - automatically extract from page object
    [currentPageIdAtom, page?._id ?? null],
    [currentPageDataAtom, page ?? null],
    [pageNotFoundAtom, options?.isNotFound ?? (page == null)],
    [latestRevisionAtom, options?.isLatestRevision ?? true],

    // Template data - from options (not auto-extracted from page)
    [templateTagsAtom, options?.templateTags ?? []],
    [templateContentAtom, options?.templateBody ?? ''],

    // Remote revision data - auto-extracted from page.revision
    [remoteRevisionIdAtom, page?.revision?._id ?? null],
    [remoteRevisionBodyAtom, page?.revision?.body ?? null],
  ]);
};
