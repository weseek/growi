import React from 'react';

import type { IUser, IUserHasId } from '@growi/core';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { useCurrentGrowiLayoutFluidClassName } from '~/client/services/layout';
import { GrowiSubNavigation } from '~/components/Navbar/GrowiSubNavigation';
import type { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import type { IUserUISettings } from '~/interfaces/user-ui-settings';
import type { UserUISettingsModel } from '~/server/models/user-ui-settings';
import {
  useCurrentProductNavWidth, useCurrentSidebarContents, useDrawerMode, usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed,
} from '~/stores/ui';

import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser, useCurrentPageId, useCurrentPathname,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useIsSearchScopeChildrenAsDefault, useIsSearchPage, useShowPageLimitationXL, useIsGuestUser, useRendererConfig,
} from '../stores/context';

import { NextPageWithLayout } from './_app.page';
import {
  CommonProps, getServerSideCommonProps, getNextI18NextConfig, generateCustomTitleForPage,
} from './utils/commons';

const TrashPageList = dynamic(() => import('~/components/TrashPageList').then(mod => mod.TrashPageList), { ssr: false });
const EmptyTrashModal = dynamic(() => import('~/components/EmptyTrashModal'), { ssr: false });
const PutbackPageModal = dynamic(() => import('~/components/PutbackPageModal'), { ssr: false });

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  showPageLimitationXL: number,

  // UI
  userUISettings?: IUserUISettings
  // Sidebar
  sidebarConfig: ISidebarConfig,

  rendererConfig: RendererConfig,
};

const TrashPage: NextPageWithLayout<CommonProps> = (props: Props) => {
  useCurrentUser(props.currentUser ?? null);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useIsSearchPage(false);
  useCurrentPageId(null);
  useCurrentPathname('/trash');

  // UserUISettings
  usePreferDrawerModeByUser(props.userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(props.userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(props.userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(props.userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(props.userUISettings?.currentProductNavWidth);

  useShowPageLimitationXL(props.showPageLimitationXL);

  useRendererConfig(props.rendererConfig);

  const { t } = useTranslation();

  const { data: isDrawerMode } = useDrawerMode();
  const { data: isGuestUser } = useIsGuestUser();

  const growiLayoutFluidClass = useCurrentGrowiLayoutFluidClassName();

  const title = generateCustomTitleForPage(props, '/trash');

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className={`dynamic-layout-root ${growiLayoutFluidClass}`}>
        <header className="py-0 position-relative">
          <GrowiSubNavigation
            pagePath="/trash"
            showDrawerToggler={isDrawerMode}
            isGuestUser={isGuestUser}
            isDrawerMode={isDrawerMode}
            additionalClasses={['container-fluid']}
          />
        </header>

        <div className="content-main grw-container-convertible mb-5 pb-5">
          <TrashPageList />
        </div>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>
      </div>
    </>
  );
};

TrashPage.getLayout = function getLayout(page) {
  return (
    <>
      <BasicLayout>
        {page}
      </BasicLayout>
      <EmptyTrashModal />
      <PutbackPageModal />
    </>
  );
};

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const { model: mongooseModel } = await import('mongoose');

  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;

  const UserUISettings = mongooseModel('UserUISettings') as UserUISettingsModel;
  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();

  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
  }
}

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService, configManager,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');
  props.showPageLimitationXL = crowi.configManager.getConfig('crowi', 'customize:showPageLimitationXL');

  props.sidebarConfig = {
    isSidebarDrawerMode: configManager.getConfig('crowi', 'customize:isSidebarDrawerMode'),
    isSidebarClosedAtDockMode: configManager.getConfig('crowi', 'customize:isSidebarClosedAtDockMode'),
  };

  props.rendererConfig = {
    isEnabledLinebreaks: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaks'),
    isEnabledLinebreaksInComments: configManager.getConfig('markdown', 'markdown:isEnabledLinebreaksInComments'),
    adminPreferredIndentSize: configManager.getConfig('markdown', 'markdown:adminPreferredIndentSize'),
    isIndentSizeForced: configManager.getConfig('markdown', 'markdown:isIndentSizeForced'),

    plantumlUri: process.env.PLANTUML_URI ?? null,
    blockdiagUri: process.env.BLOCKDIAG_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhiteList: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhiteList: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };
}

/**
 * for Server Side Translations
 * @param context
 * @param props
 * @param namespacesRequired
 */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const result = await getServerSideCommonProps(context);

  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }
  const props: Props = result.props as Props;

  if (user != null) {
    props.currentUser = user.toObject();
  }
  await injectUserUISettings(context, props);
  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default TrashPage;
