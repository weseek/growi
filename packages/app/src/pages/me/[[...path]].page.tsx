import React, { useMemo } from 'react';

import {
  IUser, IUserHasId,
} from '@growi/core';
import { model as mongooseModel } from 'mongoose';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

import { BasicLayout } from '~/components/Layout/BasicLayout';
import { CrowiRequest } from '~/interfaces/crowi-request';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import { UserUISettingsModel } from '~/server/models/user-ui-settings';
import {
  useCurrentUser, useIsSearchPage,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useCsrfToken, useIsSearchScopeChildrenAsDefault,
  useRegistrationWhiteList, useShowPageLimitationXL,
} from '~/stores/context';
import {
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from '../utils/commons';


const logger = loggerFactory('growi:pages:me');

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  userUISettings?: IUserUISettings
  sidebarConfig: ISidebarConfig,
  showPageLimitationXL: number,

  // config
  registrationWhiteList: string[],
};

const PersonalSettings = dynamic(() => import('~/components/Me/PersonalSettings'), { ssr: false });
// const MyDraftList = dynamic(() => import('~/components/MyDraftList/MyDraftList'), { ssr: false });
const InAppNotificationPage = dynamic(
  () => import('~/components/InAppNotification/InAppNotificationPage').then(mod => mod.InAppNotificationPage), { ssr: false },
);

const MePage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const { t } = useTranslation();
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
        title: t('in_app_notification.notification_list'),
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

  // // UserUISettings
  usePreferDrawerModeByUser(props.userUISettings?.preferDrawerModeByUser ?? props.sidebarConfig.isSidebarDrawerMode);
  usePreferDrawerModeOnEditByUser(props.userUISettings?.preferDrawerModeOnEditByUser);
  useSidebarCollapsed(props.userUISettings?.isSidebarCollapsed ?? props.sidebarConfig.isSidebarClosedAtDockMode);
  useCurrentSidebarContents(props.userUISettings?.currentSidebarContents);
  useCurrentProductNavWidth(props.userUISettings?.currentProductNavWidth);

  // // page
  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);
  useIsSearchScopeChildrenAsDefault(props.isSearchScopeChildrenAsDefault);

  return (
    <>
      <BasicLayout title={useCustomTitle(props, 'GROWI')}>

        <header className="py-3">
          <div className="container-fluid">
            <h1 className="title">{ targetPage.title }</h1>
          </div>
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div id="main" className='main'>
          <div id="content-main" className="content-main grw-container-convertible">
            {targetPage.component}
          </div>
        </div>

      </BasicLayout>
    </>
  );
};

async function injectUserUISettings(context: GetServerSidePropsContext, props: Props): Promise<void> {
  const req = context.req as CrowiRequest<IUserHasId & any>;
  const { user } = req;
  const UserUISettings = mongooseModel('UserUISettings') as UserUISettingsModel;

  const userUISettings = user == null ? null : await UserUISettings.findOne({ user: user._id }).exec();
  if (userUISettings != null) {
    props.userUISettings = userUISettings.toObject();
  }
}

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

  await injectUserUISettings(context, props);
  await injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation', 'admin', 'commons']);

  return {
    props,
  };
};

export default MePage;
