import React, { FC, useEffect, useState } from 'react';
import { pagePathUtils } from '@growi/core';

import {
  useCreatedAt, useDeleteUsername, useDeletedAt, useHasChildren, useHasDraftOnHackmd, useIsAbleToDeleteCompletely,
  useIsDeletable, useIsDeleted, useIsNotCreatable, useIsPageExist, useIsTrashPage, useIsUserPage, useLastUpdateUsername,
  useCurrentPageId, usePageIdOnHackmd, usePageUser, useCurrentPagePath, useRevisionCreatedAt, useRevisionId, useRevisionIdHackmdSynced,
  useShareLinkId, useShareLinksNumber, useTemplateTagData, useUpdatedAt, useCreator, useRevisionAuthor, useCurrentUser, useTargetAndAncestors,
  useSlackChannels, useNotFoundTargetPathOrId, useIsSearchPage,
} from '../../stores/context';
import {
  useIsDeviceSmallerThanMd, useIsDeviceSmallerThanLg,
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import { IUserUISettings } from '~/interfaces/user-ui-settings';

const { isTrashPage: _isTrashPage } = pagePathUtils;

const jsonNull = 'null';

const ContextExtractorOnce: FC = () => {

  const mainContent = document.querySelector('#content-main');
  const notFoundContent = document.getElementById('growi-pagetree-not-found-context');

  /*
   * App Context from DOM
   */
  const currentUser = JSON.parse(document.getElementById('growi-current-user')?.textContent || jsonNull);

  /*
   * UserUISettings from DOM
   */
  const userUISettings: Partial<IUserUISettings> = JSON.parse(document.getElementById('growi-user-ui-settings')?.textContent || jsonNull);

  /*
   * Page Context from DOM
   */
  const revisionId = mainContent?.getAttribute('data-page-revision-id');
  const path = decodeURI(mainContent?.getAttribute('data-path') || '');
  const pageId = mainContent?.getAttribute('data-page-id') || null;
  const revisionCreatedAt = +(mainContent?.getAttribute('data-page-revision-created') || '');
  const createdAt = mainContent?.getAttribute('data-page-created-at');
  const updatedAt = mainContent?.getAttribute('data-page-updated-at');
  const deletedAt = mainContent?.getAttribute('data-page-deleted-at') || null;
  const isUserPage = JSON.parse(mainContent?.getAttribute('data-page-user') || jsonNull);
  const isTrashPage = _isTrashPage(path);
  const isDeleted = JSON.parse(mainContent?.getAttribute('data-page-is-deleted') || jsonNull);
  const isDeletable = JSON.parse(mainContent?.getAttribute('data-page-is-deletable') || jsonNull);
  const isNotCreatable = JSON.parse(mainContent?.getAttribute('data-page-is-not-creatable') || jsonNull);
  const isAbleToDeleteCompletely = JSON.parse(mainContent?.getAttribute('data-page-is-able-to-delete-completely') || jsonNull);
  const isPageExist = mainContent?.getAttribute('data-page-id') != null;
  const pageUser = JSON.parse(mainContent?.getAttribute('data-page-user') || jsonNull);
  const hasChildren = JSON.parse(mainContent?.getAttribute('data-page-has-children') || jsonNull);
  const templateTagData = mainContent?.getAttribute('data-template-tags') || null;
  const shareLinksNumber = mainContent?.getAttribute('data-share-links-number');
  const shareLinkId = JSON.parse(mainContent?.getAttribute('data-share-link-id') || jsonNull);
  const revisionIdHackmdSynced = mainContent?.getAttribute('data-page-revision-id-hackmd-synced') || null;
  const lastUpdateUsername = mainContent?.getAttribute('data-page-last-update-username') || null;
  const deleteUsername = mainContent?.getAttribute('data-page-delete-username') || null;
  const pageIdOnHackmd = mainContent?.getAttribute('data-page-id-on-hackmd') || null;
  const hasDraftOnHackmd = !!mainContent?.getAttribute('data-page-has-draft-on-hackmd');
  const creator = JSON.parse(mainContent?.getAttribute('data-page-creator') || jsonNull);
  const revisionAuthor = JSON.parse(mainContent?.getAttribute('data-page-revision-author') || jsonNull);
  const targetAndAncestors = JSON.parse(document.getElementById('growi-pagetree-target-and-ancestors')?.textContent || jsonNull);
  const notFoundTargetPathOrId = JSON.parse(notFoundContent?.getAttribute('data-not-found-target-path-or-id') || jsonNull);
  const slackChannels = mainContent?.getAttribute('data-slack-channels') || '';
  const isSearchPage = document.getElementById('search-page') != null;

  /*
   * use static swr
   */
  // App
  useCurrentUser(currentUser);

  // UserUISettings
  usePreferDrawerModeByUser(userUISettings?.preferDrawerModeByUser);
  usePreferDrawerModeOnEditByUser(userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(userUISettings?.isSidebarCollapsed);
  useCurrentSidebarContents(userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(userUISettings?.currentProductNavWidth);

  // Page
  useCreatedAt(createdAt);
  useDeleteUsername(deleteUsername);
  useDeletedAt(deletedAt);
  useHasChildren(hasChildren);
  useHasDraftOnHackmd(hasDraftOnHackmd);
  useIsAbleToDeleteCompletely(isAbleToDeleteCompletely);
  useIsDeletable(isDeletable);
  useIsDeleted(isDeleted);
  useIsNotCreatable(isNotCreatable);
  useIsPageExist(isPageExist);
  useIsTrashPage(isTrashPage);
  useIsUserPage(isUserPage);
  useLastUpdateUsername(lastUpdateUsername);
  useCurrentPageId(pageId);
  usePageIdOnHackmd(pageIdOnHackmd);
  usePageUser(pageUser);
  useCurrentPagePath(path);
  useRevisionCreatedAt(revisionCreatedAt);
  useRevisionId(revisionId);
  useRevisionIdHackmdSynced(revisionIdHackmdSynced);
  useShareLinkId(shareLinkId);
  useShareLinksNumber(shareLinksNumber);
  useTemplateTagData(templateTagData);
  useUpdatedAt(updatedAt);
  useCreator(creator);
  useRevisionAuthor(revisionAuthor);
  useTargetAndAncestors(targetAndAncestors);
  useNotFoundTargetPathOrId(notFoundTargetPathOrId);
  useIsSearchPage(isSearchPage);

  // Navigation
  usePreferDrawerModeByUser();
  usePreferDrawerModeOnEditByUser();
  useIsDeviceSmallerThanMd();

  // Navigation
  usePreferDrawerModeByUser();
  usePreferDrawerModeOnEditByUser();
  useIsDeviceSmallerThanMd();

  // Editor
  useSlackChannels(slackChannels);

  // SearchResult
  useIsDeviceSmallerThanLg();

  return null;
};

const ContextExtractor: FC = React.memo(() => {
  const [isRunOnce, setRunOnce] = useState(false);

  useEffect(() => {
    setRunOnce(true);
  }, []);

  return isRunOnce ? null : <ContextExtractorOnce></ContextExtractorOnce>;
});

export default ContextExtractor;
