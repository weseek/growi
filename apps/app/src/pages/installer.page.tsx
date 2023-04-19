import React, { useMemo } from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';
import Head from 'next/head';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';

import InstallerForm from '../components/InstallerForm';
import {
  useCsrfToken, useAppTitle, useSiteUrl, useConfidential,
} from '../stores/context';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, generateCustomTitle,
} from './utils/commons';


const DataTransferForm = dynamic(() => import('../components/DataTransferForm'), { ssr: false });
const CustomNavAndContents = dynamic(() => import('../components/CustomNavigation/CustomNavAndContents'), { ssr: false });

const { isTrashPage: _isTrashPage } = pagePathUtils;

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired, true);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

type Props = CommonProps & {

  pageWithMetaStr: string,
};

const InstallerPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();
  const { t: tCommons } = useTranslation('commons');

  const navTabMapping = useMemo(() => {
    return {
      user_infomation: {
        Icon: () => <i className="icon-fw icon-user"></i>,
        Content: InstallerForm,
        i18n: t('installer.tab'),
      },
      external_accounts: {
        Icon: () => <i className="icon-fw icon-share-alt"></i>,
        Content: DataTransferForm,
        i18n: tCommons('g2g_data_transfer.tab'),
      },
    };
  }, [t, tCommons]);

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  const title = generateCustomTitle(props, t('installer.title'));
  const classNames: string[] = [];

  return (
    <NoLoginLayout className={classNames.join(' ')}>
      <Head>
        <title>{title}</title>
      </Head>
      <div id="installer-form-container" className="nologin-dialog mx-auto">
        <CustomNavAndContents navTabMapping={navTabMapping} tabContentClasses={['p-0']} />
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
