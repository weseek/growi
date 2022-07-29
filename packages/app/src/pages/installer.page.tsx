import React from 'react';

import { pagePathUtils } from '@growi/core';
import {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { RawLayout } from '~/components/Layout/RawLayout';

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

  // commons
  useAppTitle(props.appTitle);
  useSiteUrl(props.siteUrl);
  useConfidential(props.confidential);
  useCsrfToken(props.csrfToken);

  // page
  useCurrentPagePath(props.currentPathname);

  const classNames: string[] = [];

  return (
    <>
      <RawLayout title={useCustomTitle(props, 'GROWI')} className={classNames.join(' ')}>
        <div className='nologin'>
          <div id="wrapper">
            <div id="page-wrapper">
              <div className="main container-fluid">

                <div className="row">

                  <div className="col-md-12">
                    <div className="login-header mx-auto">
                      <div className="logo"></div>
                      <h1 className="my-3">GROWI</h1>
                      <div className="login-form-errors px-3"></div>
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div id="installer-form-container">
                      <InstallerForm />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </RawLayout>
    </>
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
