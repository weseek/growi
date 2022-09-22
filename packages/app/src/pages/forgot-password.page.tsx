import React from 'react';

import { NextPage, GetServerSideProps, GetServerSidePropsContext } from 'next';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import dynamic from 'next/dynamic';

import { CrowiRequest } from '~/interfaces/crowi-request';

import {
  CommonProps, getNextI18NextConfig, getServerSideCommonProps,
} from './utils/commons';

const PasswordResetRequestForm = dynamic(() => import('~/components/PasswordResetRequestForm'), { ssr: false });

type Props = CommonProps & {
  isLocalStrategySetup: boolean,
  isPasswordResetEnabled: boolean,
};

const ForgotPasswordPage: NextPage<Props> = (props: Props) => {
  const { t } = useTranslation();

  const isEnabled = props.isLocalStrategySetup && props.isPasswordResetEnabled;

  return (
    <div id="main" className="main">
      <div id="content-main" className="content-main container-lg">
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-md-6 mt-5">
              <div className="text-center">
                <h1><i className="icon-lock large"></i></h1>
                <h1 className="text-center">{ t('forgot_password.forgot_password') }</h1>
                { isEnabled
                  ? <PasswordResetRequestForm />
                  : <h3 className="text-muted">This feature is unavailable.</h3>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

async function injectNextI18NextConfigurations(context: GetServerSidePropsContext, props: Props, namespacesRequired?: string[] | undefined): Promise<void> {
  const nextI18NextConfig = await getNextI18NextConfig(serverSideTranslations, context, namespacesRequired);
  props._nextI18Next = nextI18NextConfig._nextI18Next;
}

function injectServerConfigurations(context: GetServerSidePropsContext, props: Props): void {
  const req: CrowiRequest = context.req as CrowiRequest;
  const { crowi } = req;

  props.isPasswordResetEnabled = crowi.configManager.getConfig('crowi', 'security:passport-local:isPasswordResetEnabled');
  props.isLocalStrategySetup = crowi.passportService.isLocalStrategySetup;
}

export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const result = await getServerSideCommonProps(context);

  // check for presence
  // see: https://github.com/vercel/next.js/issues/19271#issuecomment-730006862
  if (!('props' in result)) {
    throw new Error('invalid getSSP result');
  }

  const props: Props = result.props as Props;

  injectServerConfigurations(context, props);
  await injectNextI18NextConfigurations(context, props, ['translation']);

  return {
    props,
  };
};

export default ForgotPasswordPage;
