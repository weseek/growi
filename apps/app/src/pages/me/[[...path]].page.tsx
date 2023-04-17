import React, { useMemo } from 'react';

import { IUserHasId } from '@growi/core';
import {
  GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { CrowiRequest } from '~/interfaces/crowi-request';
import type { RendererConfig } from '~/interfaces/services/renderer';
import {
  useCurrentUser, useIsSearchPage,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useCsrfToken, useIsSearchScopeChildrenAsDefault,
  useRegistrationWhiteList, useShowPageLimitationXL, useRendererConfig,
} from '~/stores/context';
import loggerFactory from '~/utils/logger';

import { NextPageWithLayout } from '../_app.page';
import type { CommonProps } from '../utils/commons';
import {
  getNextI18NextConfig, getServerSideCommonProps, generateCustomTitle, useInitSidebarConfig,
} from '../utils/commons';


const logger = loggerFactory('growi:pages:me');

type Props = CommonProps & {
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  rendererConfig: RendererConfig,
  showPageLimitationXL: number,

  // config
  registrationWhiteList: string[],
};

const PersonalSettings = dynamic(() => import('~/components/Me/PersonalSettings'), { ssr: false });
// const MyDraftList = dynamic(() => import('~/components/MyDraftList/MyDraftList'), { ssr: false });
const InAppNotificationPage = dynamic(
  () => import('~/components/InAppNotification/InAppNotificationPage').then(mod => mod.InAppNotificationPage), { ssr: false },
);

const MePage: NextPageWithLayout<Props> = (props: Props) => {
  const router = useRouter();
  const { t } = useTranslation(['translation', 'commons']);
  const { path } = router.query;
  const pagePathKeys: string[] = Array.isArray(path) ? path : ['personal-settings'];

  const mePagesMap = useMemo(() => {
    return {
      'personal-settings': {
        title: t('User Settings'),
        component: <PersonalSettings />,
      },
      // drafts: {
      //   title: t('My Drafts'),
      //   component: <MyDraftList />,
      // },
      'all-in-app-notifications': {
        title: t('commons:in_app_notification.notification_list'),
        component: <InAppNotificationPage />,
      },
    };
  }, [t]);

  const getTargetPageToRender = (pagesMap, keys): {title: string, component: JSX.Element} => {
    return keys.reduce((pagesMap, key) => {
      return pagesMap[key];
    }, pagesMap);
  };

  const targetPage = getTargetPageToRender(mePagesMap, pagePathKeys);

  useIsSearchPage(false);

  useCurrentUser(props.currentUser ?? null);

  useRegistrationWhiteList(props.registrationWhiteList);

  useShowPageLimitationXL(props.showPageLimitationXL);

  // commons
  useCsrfToken(props.csrfToken);

  // init sidebar config with UserUISettings and sidebarConfig
  useInitSidebarConfig(props.sidebarConfig, props.userUISettings);

  // page
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  useRendererConfig(props.rendererConfig);

  const title = generateCustomTitle(props, targetPage.title);

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className="dynamic-layout-root">
        <header className="py-3">
          <div className="container-fluid">
            <h1 className="title">{ targetPage.title }</h1>
          </div>
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div id="main" className='main'>
          <div id="content-main" className="content-main container-lg grw-container-convertible">
            {targetPage.component}
          </div>
        </div>
      </div>
    </>
  );
};

MePage.getLayout = function getLayout(page) {
  return (
    <BasicLayout>{page}</BasicLayout>
  );
};

async function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    searchService,
    configManager,
  } = crowi;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;
  props.isSearchScopeChildrenAsDefault = configManager.getConfig('crowi', 'customize:isSearchScopeChildrenAsDefault');

  props.registrationWhiteList = configManager.getConfig('crowi', 'security:registrationWhiteList');

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

    drawioUri: configManager.getConfig('crowi', 'app:drawioUri'),
    plantumlUri: process.env.PLANTUML_URI ?? null,

    // XSS Options
    isEnabledXssPrevention: configManager.getConfig('markdown', 'markdown:rehypeSanitize:isEnabledPrevention'),
    xssOption: configManager.getConfig('markdown', 'markdown:rehypeSanitize:option'),
    attrWhiteList: JSON.parse(crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:attributes')),
    tagWhiteList: crowi.configManager.getConfig('markdown', 'markdown:rehypeSanitize:tagNames'),
    highlightJsStyleBorder: crowi.configManager.getConfig('crowi', 'customize:highlightJsStyleBorder'),
  };
}

// /**
//  * for Server Side Translations
//  * @param context
//  * @param props
//  * @param namespacesRequired
//  */
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  // preload all languages because of language lists in user setting
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired, true);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user, crowi } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  if (user != null) {
    const User = crowi.model('User');
    const userData = await User.findById(req.user.id).populate({ path: 'imageAttachment', select: 'filePathProxied' });
    props.currentUser = userData.toObject();
  }

  await injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation', 'admin', 'commons']);

  return {
    props,
  };
};

export default MePage;
