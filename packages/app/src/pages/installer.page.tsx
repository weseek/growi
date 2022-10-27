import React from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';

import InstallerForm from '../components/InstallerForm';
import {
  useCurrentPagePath, useCsrfToken,
  useAppTitle, useSiteUrl, useConfidential,
} from '../stores/context';


import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';


const { isTrashPage: _isTrashPage } = pagePathUtils;

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired, true);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

type Props = CommonProps & {

  pageWithMetaStr: string,
};

const InstallerPage: NextPage<Props> = (props: Props) => {

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPagePath(props.currentPathname);

  const classNames: string[] = [];

  return (
    <NoLoginLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
      <div id="installer-form-container">
        <InstallerForm />
      </div>
    </NoLoginLayout>
  );
};

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default InstallerPage;
