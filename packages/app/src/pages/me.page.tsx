import React from 'react';

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

import { CrowiRequest } from '~/interfaces/crowi-request';
import { ISidebarConfig } from '~/interfaces/sidebar-config';
import { IUserUISettings } from '~/interfaces/user-ui-settings';
import { UserUISettingsModel } from '~/server/models/user-ui-settings';
import {
  usePreferDrawerModeByUser, usePreferDrawerModeOnEditByUser, useSidebarCollapsed, useCurrentSidebarContents, useCurrentProductNavWidth,
} from '~/stores/ui';
import loggerFactory from '~/utils/logger';


import { BasicLayout } from '../components/Layout/BasicLayout';
import {
  useCurrentUser,
  useIsSearchServiceConfigured, useIsSearchServiceReachable,
  useCsrfToken, useIsSearchScopeChildrenAsDefault,
  useRegistrationWhiteList,
} from '../stores/context';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';


const logger = loggerFactory('growi:pages:me');

type Props = CommonProps & {
  currentUser: IUser,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
  isSearchScopeChildrenAsDefault: boolean,
  userUISettings?: IUserUISettings
  sidebarConfig: ISidebarConfig,

  // config
  registrationWhiteList: string[],
};

const MePage: NextPage<Props> = (props: Props) => {
  useCurrentUser(props.currentUser ?? null);

  useRegistrationWhiteList(props.registrationWhiteList);

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
  const { t } = useTranslation();

  const PersonalSettings = dynamic(() => import('~/components/Me/PersonalSettings'), { ssr: false });

  return (
    <>
      <BasicLayout title={useCustomTitle(props, 'GROWI')}>

        <header className="py-3">
          <div className="container-fluid">
            <h1 className="title">{t('User Settings')}</h1>
          </div>
        </header>

        <div id="grw-fav-sticky-trigger" className="sticky-top"></div>

        <div id="main" className='main'>
          <div id="content-main" className="content-main grw-container-convertible">
            <PersonalSettings />
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
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
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
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default MePage;
