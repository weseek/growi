import React, { useMemo } from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';

import CustomNavAndContents from '../components/CustomNavigation/CustomNavAndContents';
import DataTransferForm from '../components/DataTransferForm';
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
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

type Props = CommonProps & {

  pageWithMetaStr: string,
};

const InstallerPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  const navTabMapping = useMemo(() => {
    return {
      user_infomation: {
        Icon: () => <i className="icon-fw icon-user"></i>,
        Content: InstallerForm,
        i18n: t('installer.tab'),
        index: 0,
      },
      external_accounts: {
        Icon: () => <i className="icon-fw icon-share-alt"></i>,
        Content: DataTransferForm,
        i18n: t('g2g_data_transfer.tab'),
        index: 1,
      },
    };
  }, [t]);

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
      <div id="installer-form-container" className="noLogin-dialog mx-auto">
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

  injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default InstallerPage;
