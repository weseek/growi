import type { IPagePopulatedToShowRevision } from '@growi/core';
import { useHydrateAtoms } from 'jotai/utils';

import {
  currentPageIdAtom,
  currentPageDataAtom,
  pageNotFoundAtom,
  latestRevisionAtom,
  templateTagsAtom,
  templateBodyAtom,
  remoteRevisionIdAtom,
  remoteRevisionBodyAtom,
  pageNotCreatableAtom,
} from './internal-atoms';

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
 * useHydratePageAtoms(pageWithMeta?.data);
 *
 * // With template data and custom flags
 * useHydratePageAtoms(pageWithMeta?.data, {
 *   isLatestRevision: false,
 *   templateTags: ['tag1', 'tag2'],
 *   templateBody: 'Template content'
 * });
 */
export const useHydratePageAtoms = (
    page: IPagePopulatedToShowRevision | undefined,
    options?: {
      isNotFound?: boolean;
      isNotCreatable?: boolean;
      isLatestRevision?: boolean;
      templateTags?: string[];
      templateBody?: string;
    },
): void => {
  useHydrateAtoms([
    // Core page state - automatically extract from page object
    [currentPageIdAtom, page?._id],
    [currentPageDataAtom, page],
    [pageNotFoundAtom, options?.isNotFound ?? (page == null || page.isEmpty)],
    [pageNotCreatableAtom, options?.isNotCreatable ?? false],
    [latestRevisionAtom, options?.isLatestRevision ?? true],

    // Template data - from options (not auto-extracted from page)
    [templateTagsAtom, options?.templateTags ?? []],
    [templateBodyAtom, options?.templateBody ?? ''],

    // Remote revision data - auto-extracted from page.revision
    [remoteRevisionIdAtom, page?.revision?._id],
    [remoteRevisionBodyAtom, page?.revision?.body],
  ]);
};

/**
 * Hook for hydrating shared page atoms with server-side data
 * This is a simplified version that focuses on the most common use case:
 * hydrating with page ID and not found status
 * @param args
 */
export const useHydrateSharedPageAtoms = (
    args: {
      pageId: string | undefined;
      isNotFound: boolean;
    },
): void => {
  useHydrateAtoms([
    // Core page state - automatically extract from page object
    [currentPageIdAtom, args.pageId],
    [currentPageDataAtom, undefined],
    [pageNotFoundAtom, args.isNotFound],
    [latestRevisionAtom, true],

    // Template data - from options (not auto-extracted from page)
    [templateTagsAtom, []],
    [templateBodyAtom, ''],

    // Remote revision data - auto-extracted from page.revision
    [remoteRevisionIdAtom, undefined],
    [remoteRevisionBodyAtom, undefined],
  ]);
};
