import React, { useEffect } from 'react';

import { pagePathUtils } from '@growi/core';
import { isValidObjectId } from 'mongoose';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { CrowiRequest } from '~/interfaces/crowi-request';
import { IPageWithMeta } from '~/interfaces/page';
import { PageModel } from '~/server/models/page';
import { useSWRxCurrentPage, useSWRxPageInfo } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { BasicLayout } from '../components/BasicLayout';
import InstallerForm from '../components/InstallerForm';
import {
  useCurrentUser, useCurrentPagePath,
  useOwnerOfCurrentPage,
  useIsForbidden, useIsNotFound, useIsTrashPage, useShared, useShareLinkId, useIsSharedUser, useIsAbleToDeleteCompletely,
  useAppTitle, useSiteUrl, useConfidential, useIsEnabledStaleNotification,
  useIsSearchServiceConfigured, useIsSearchServiceReachable, useIsMailerSetup,
  useAclEnabled, useHasSlackConfig, useDrawioUri, useHackmdUri, useMathJax, useNoCdn, useEditorConfig, useCsrfToken,
} from '../stores/context';

import { CommonProps, getServerSideCommonProps, useCustomTitle } from './commons';


const logger = loggerFactory('growi:pages:all');
const { isUsersHomePage, isTrashPage: _isTrashPage } = pagePathUtils;

type Props = CommonProps & {
  currentUser: string,
  userName: string | undefined,
  name: string | undefined,
  email: string | undefined,

  pageWithMetaStr: string,

  isForbidden: boolean,
  isNotFound: boolean,
  isSearchServiceConfigured: boolean,
  isSearchServiceReachable: boolean,
};

const InstallerPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();

  const { data: currentUser } = useCurrentUser(props.currentUser != null ? JSON.parse(props.currentUser) : null);

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPagePath(props.currentPathname);

  useIsSearchServiceConfigured(props.isSearchServiceConfigured);
  useIsSearchServiceReachable(props.isSearchServiceReachable);

  let pageWithMeta: IPageWithMeta | undefined;
  if (props.pageWithMetaStr != null) {
    pageWithMeta = JSON.parse(props.pageWithMetaStr) as IPageWithMeta;
  }
  useSWRxCurrentPage(undefined, pageWithMeta?.data); // store initial data
  useSWRxPageInfo(pageWithMeta?.data._id, undefined, pageWithMeta?.meta); // store initial data

  const classNames: string[] = [];

  return (
    <>
      <Head>
      </Head>
      {/* <BasicLayout title={useCustomTitle(props, t('GROWI'))} className={classNames.join(' ')}> */}
      <BasicLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <div id="content-main" className="content-main grw-container-convertible">
          <InstallerForm userName={props.userName} name={props.name} email={props.email} />
        </div>
      </BasicLayout>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;
  const {
    appService, searchService, configManager, aclService, slackNotificationService, mailService,
  } = crowi;

  const { user } = req;

  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;
  // await injectPageInformation(context, props);

  if (user != null) {
    props.currentUser = JSON.stringify(user);
  }
  props.userName = user?.username;
  props.name = user?.name;
  props.email = user?.email;

  props.isSearchServiceConfigured = searchService.isConfigured;
  props.isSearchServiceReachable = searchService.isReachable;

  return {
    props,
  };
};

export default InstallerPage;
