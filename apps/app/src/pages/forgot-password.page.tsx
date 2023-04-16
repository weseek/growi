import React from 'react';

import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps,
} from './utils/commons';

const PasswordResetRequestForm = dynamic(() => import('~/components/PasswordResetRequestForm'), { ssr: false });

const ForgotPasswordPage: NextPage = () => {
  const { t } = useTranslation();

  return (
    <div id="main" className="main">
      <div id="content-main" className="content-main container-lg">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-6 mt-5">
              <div className="text-center">
                <h1><i className="icon-lock large"></i></h1>
                <h1 className="text-center">{ t('forgot_password.forgot_password') }</h1>
                <PasswordResetRequestForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// eslint-disable-next-line max-len
async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: CommonProps, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: CommonProps = result.props as CommonProps;

  await injectNextI18NextConfigurations(context, props, ['translation', 'commons']);

  return {
    props,
  };
};

export default ForgotPasswordPage;
