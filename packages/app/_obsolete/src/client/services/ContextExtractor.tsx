/* eslint-disable */
import React, { FC, useEffect, useState } from 'react';

import { pagePathUtils } from '@growi/core';

import { CustomWindow } from '~/interfaces/global';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
// import { generatePreviewRenderer } from '~/services/renderer/growi-renderer';
import {
  useIsDeviceSmallerThanMd, useIsDeviceSmallerThanLg,
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
  useSelectedGrant,
} from '~/stores/ui';
import { useSetupGlobalSocket, useSetupGlobalAdminSocket } from '~/stores/websocket';

import {
  useSiteUrl,
  useDeleteUsername, useDeletedAt, useHasChildren, useHasDraftOnHackmd,
  useIsTrashPage, useIsUserPage, useLastUpdateUsername,
  useCurrentPageId, usePageIdOnHackmd, usePageUser, useCurrentPagePath, useRevisionCreatedAt, useRevisionId, useRevisionIdHackmdSynced,
  useShareLinkId, useShareLinksNumber, useTemplateTagData, useCurrentUser, useTargetAndAncestors,
  useIsSearchPage, useIsForbidden, useIsIdenticalPath, useHasParent,
  useIsAclEnabled, useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsEnabledAttachTitleHeader,
  useDefaultIndentSize, useIsIndentSizeForced, useCsrfToken, useGrowiVersion, useAuditLogEnabled,
  useActivityExpirationSeconds, useAuditLogAvailableActions, useRendererConfig,
} from '../../stores/context';

const { isTrashPage: _isTrashPage } = pagePathUtils;

const jsonNull = 'null';

const ContextExtractorOnce: FC = () => {

  const mainContent = document.querySelector('#content-main');
  const notFoundContentForPt = document.getElementById('growi-pagetree-not-found-context');
  const notFoundContext = document.getElementById('growi-not-found-context');
  const forbiddenContent = document.getElementById('forbidden-page');

  // get csrf token from body element
  // DO NOT REMOVE: uploading attachment data requires appContainer.csrfToken
  const body = document.querySelector('body');
  const csrfToken = body?.dataset.csrftoken;

  /*
   * App Context from DOM
   */
  const currentUser = JSON.parse(document.getElementById('growi-current-user')?.textContent || jsonNull);

  /*
   * Settings from context-hydrate DOM
   */
  const configByContextHydrate = JSON.parse(document.getElementById('growi-context-hydrate')?.textContent || jsonNull);

  /*
   * UserUISettings from DOM
   */
  const userUISettings: Partial<IUserUISettings> = JSON.parse(document.getElementById('growi-user-ui-settings')?.textContent || jsonNull);

  /*
   * Page Context from DOM
   */
  const revisionId = mainContent?.getAttribute('data-page-revision-id');
  const path = decodeURI(mainContent?.getAttribute('data-path') || '');
  // assign `null` to avoid returning empty string
  const pageId = mainContent?.getAttribute('data-page-id') || null;

  const revisionCreatedAt = +(mainContent?.getAttribute('data-page-revision-created') || '');

  const deletedAt = mainContent?.getAttribute('data-page-deleted-at') || null;
  const isIdenticalPath = JSON.parse(mainContent?.getAttribute('data-identical-path') || jsonNull) ?? false;
  const isUserPage = JSON.parse(mainContent?.getAttribute('data-page-user') || jsonNull) != null;
  const isTrashPage = _isTrashPage(path);
  const isNotCreatable = JSON.parse(mainContent?.getAttribute('data-page-is-not-creatable') || jsonNull) ?? false;
  const isForbidden = forbiddenContent != null;
  const pageUser = JSON.parse(mainContent?.getAttribute('data-page-user') || jsonNull);
  const hasChildren = JSON.parse(mainContent?.getAttribute('data-page-has-children') || jsonNull);
  const hasParent = JSON.parse(mainContent?.getAttribute('data-has-parent') || jsonNull);
  const templateTagData = mainContent?.getAttribute('data-template-tags') || null;
  const shareLinksNumber = mainContent?.getAttribute('data-share-links-number');
  const shareLinkId = JSON.parse(mainContent?.getAttribute('data-share-link-id') || jsonNull);
  const revisionIdHackmdSynced = mainContent?.getAttribute('data-page-revision-id-hackmd-synced') || null;
  const lastUpdateUsername = mainContent?.getAttribute('data-page-last-update-username') || null;
  const deleteUsername = mainContent?.getAttribute('data-page-delete-username') || null;
  const pageIdOnHackmd = mainContent?.getAttribute('data-page-id-on-hackmd') || null;
  const hasDraftOnHackmd = !!mainContent?.getAttribute('data-page-has-draft-on-hackmd');
  const targetAndAncestors = JSON.parse(document.getElementById('growi-pagetree-target-and-ancestors')?.textContent || jsonNull);
  const notFoundTargetPathOrId = JSON.parse(notFoundContentForPt?.getAttribute('data-not-found-target-path-or-id') || jsonNull);
  const isSearchPage = document.getElementById('search-page') != null;
  const isEmptyPage = JSON.parse(mainContent?.getAttribute('data-page-is-empty') || jsonNull) ?? false;

  const grant = +(mainContent?.getAttribute('data-page-grant') || 1);
  const grantGroupId = mainContent?.getAttribute('data-page-grant-group') || null;
  const grantGroupName = mainContent?.getAttribute('data-page-grant-group-name') || null;

  /*
   * use static swr
   */
  useCsrfToken(csrfToken);

  // App
  useCurrentUser(currentUser);

  // UserUISettings
  usePreferDrawerModeByUser(userUISettings?.preferDrawerModeByUser ?? configByContextHydrate.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(userUISettings?.isSidebarCollapsed ?? configByContextHydrate.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(userUISettings?.currentProductNavWidth);

  // hydrated config
  useSiteUrl(configByContextHydrate.crowi.url);
  useIsAclEnabled(configByContextHydrate.isAclEnabled);
  useIsSearchServiceConfigured(configByContextHydrate.isSearchServiceConfigured);
  useIsSearchServiceReachable(configByContextHydrate.isSearchServiceReachable);
  useIsEnabledAttachTitleHeader(configByContextHydrate.isEnabledAttachTitleHeader);
  useIsIndentSizeForced(configByContextHydrate.isIndentSizeForced);
  useDefaultIndentSize(configByContextHydrate.adminPreferredIndentSize);
  useAuditLogEnabled(configByContextHydrate.auditLogEnabled);
  useActivityExpirationSeconds(configByContextHydrate.activityExpirationSeconds);
  useAuditLogAvailableActions(configByContextHydrate.auditLogAvailableActions);
  useGrowiVersion(configByContextHydrate.crowi.version);
  useRendererConfig({
    isEnabledLinebreaks: configByContextHydrate.isEnabledLinebreaks,
    isEnabledLinebreaksInComments: configByContextHydrate.isEnabledLinebreaksInComments,
    adminPreferredIndentSize: configByContextHydrate.adminPreferredIndentSize,
    isIndentSizeForced: configByContextHydrate.isIndentSizeForced,

    isEnabledXssPrevention: configByContextHydrate.isEnabledXssPrevention,
    attrWhiteList: configByContextHydrate.attrWhiteList,
    tagWhiteList: configByContextHydrate.tagWhiteList,
    highlightJsStyleBorder: configByContextHydrate.highlightJsStyleBorder,

    plantumlUri: configByContextHydrate.env.PLANTUML_URI,
    blockdiagUri: configByContextHydrate.env.BLOCKDIAG_URI,
  });
  // useNoCdn(configByContextHydrate.env.NO_CDN);
  // useUploadableImage(configByContextHydrate.upload.image);
  // useUploadableFile(configByContextHydrate.upload.file);

  // Page
  useDeleteUsername(deleteUsername);
  useDeletedAt(deletedAt);
  useHasChildren(hasChildren);
  useHasDraftOnHackmd(hasDraftOnHackmd);
  useIsIdenticalPath(isIdenticalPath);
  // useIsNotCreatable(isNotCreatable);
  useIsForbidden(isForbidden);
  // useIsTrashPage(isTrashPage);
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
  useTargetAndAncestors(targetAndAncestors);
  useIsSearchPage(isSearchPage);
  useHasParent(hasParent);

  // Navigation
  usePreferDrawerModeByUser();
  usePreferDrawerModeOnEditByUser();
  useIsDeviceSmallerThanMd();

  // Editor
  // useSelectedGrant(grant);
  // useSelectedGrantGroupId(grantGroupId);
  // useSelectedGrantGroupName(grantGroupName);

  // SearchResult
  useIsDeviceSmallerThanLg();

  // Global Socket
  useSetupGlobalSocket();
  const shouldInitAdminSock = !!currentUser?.isAdmin;
  useSetupGlobalAdminSocket(shouldInitAdminSock);

  // TODO: Remove this code when reveal.js is omitted. see: https://github.com/weseek/growi/pull/6223
  // Do not access this property from other than reveal.js plugins.
  // (window as CustomWindow).previewRenderer = generatePreviewRenderer(
  //   {
  //     isEnabledXssPrevention: configByContextHydrate.isEnabledXssPrevention,
  //     attrWhiteList: configByContextHydrate.attrWhiteList,
  //     tagWhiteList: configByContextHydrate.tagWhiteList,
  //     highlightJsStyleBorder: configByContextHydrate.highlightJsStyleBorder,
  //     env: {
  //       MATHJAX: configByContextHydrate.env.MATHJAX,
  //       PLANTUML_URI: configByContextHydrate.env.PLANTUML_URI,
  //       BLOCKDIAG_URI: configByContextHydrate.env.BLOCKDIAG_URI,
  //     },
  //   },
  //   null,
  //   path,
  // );

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
