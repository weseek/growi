import React, { useState } from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'react-i18next';
import {
  Nav, NavItem, NavLink,
} from 'reactstrap';

import { NoLoginLayout } from '~/components/Layout/NoLoginLayout';

import DataTransferForm from '../components/DataTransferForm';
import InstallerForm from '../components/InstallerForm';
import {
  useCurrentPagePath, useCsrfToken,
  useAppTitle, useSiteUrl, useConfidential,
} from '../stores/context';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps, useCustomTitle,
} from './utils/commons';

import styles from '../components/CustomNavigation/CustomNav.module.scss';

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

  const [isCreateUserTab, setCreateUserTab] = useState(true);

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
        <div className={`noLogin-dialog grw-custom-nav-tab mx-auto ${styles['grw-custom-nav-tab']}`} >
          <Nav className="nav-title text-center w-100">
            <NavItem className={`col-6 p-0 ${isCreateUserTab ? 'active' : ''}`}>
              <NavLink type="button" className="text-white" onClick={() => setCreateUserTab(true)}>
                {t('installer.tab')}
              </NavLink>
            </NavItem>
            <NavItem className={`col-6 p-0 ${isCreateUserTab ? '' : 'active'}`}>
              <NavLink type="button" className="text-white" onClick={() => setCreateUserTab(false)}>
                {t('g2g_data_transfer.tab')}
              </NavLink>
            </NavItem>
          </Nav>
          <hr className="my-0 grw-nav-slide-hr border-none" style={{ width: '50%', marginLeft: isCreateUserTab ? '0%' : '50%', borderColor: 'white' }} />
        </div>
        {isCreateUserTab ? (
          <InstallerForm />
        ) : (
          <DataTransferForm />
        )}
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
